const { getPool } = require('../config/database');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

class MasterController {
    // Get all masters for current user
    async getAll(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;

            const result = await pool.request()
                .input('userId', userId)
                .query(`
                    SELECT 
                        Id AS id,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(TotalIncome AS DECIMAL(18,0)) AS totalIncome,
                        CAST(TotalExpense AS DECIMAL(18,0)) AS totalExpense
                    FROM Masters
                    WHERE UserId = @userId
                    ORDER BY Date DESC, Id DESC
                `);

            res.json({
                success: true,
                data: result.recordset
            });

        } catch (error) {
            console.error('Get masters error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get masters',
                error: error.message
            });
        }
    }


    // Get master by ID
    async getById(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const masterId = parseInt(req.params.id);

            const result = await pool.request()
                .input('masterId', masterId)
                .input('userId', userId)
                .query(`
                    SELECT 
                        Id AS id,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(TotalIncome AS DECIMAL(18,0)) AS totalIncome,
                        CAST(TotalExpense AS DECIMAL(18,0)) AS totalExpense
                    FROM Masters
                    WHERE Id = @masterId AND UserId = @userId
                `);

            if (result.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found'
                });
            }

            res.json({
                success: true,
                data: result.recordset[0]
            });

        } catch (error) {
            console.error('Get master error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get master',
                error: error.message
            });
        }
    }

    // Create new master
    async create(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const { description, date } = req.body;

            if (!description || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Description and date are required'
                });
            }

            const result = await pool.request()
                .input('userId', userId)
                .input('description', description)
                .input('date', date)
                .query(`
                    INSERT INTO Masters (UserId, Description, Date)
                    VALUES (@userId, @description, @date);
                    SELECT SCOPE_IDENTITY() AS MasterId;
                `);

            const masterId = result.recordset[0].MasterId;

            // Get the created master
            const masterResult = await pool.request()
                .input('masterId', masterId)
                .query(`
                    SELECT 
                        Id AS id,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(TotalIncome AS DECIMAL(18,0)) AS totalIncome,
                        CAST(TotalExpense AS DECIMAL(18,0)) AS totalExpense
                    FROM Masters
                    WHERE Id = @masterId
                `);

            res.status(201).json({
                success: true,
                message: 'Master created successfully',
                data: masterResult.recordset[0]
            });

        } catch (error) {
            console.error('Create master error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create master',
                error: error.message
            });
        }
    }

    // Update master
    async update(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const masterId = parseInt(req.params.id);
            const { description, date } = req.body;

            if (!description || !date) {
                return res.status(400).json({
                    success: false,
                    message: 'Description and date are required'
                });
            }

            const result = await pool.request()
                .input('masterId', masterId)
                .input('userId', userId)
                .input('description', description)
                .input('date', date)
                .query(`
                    UPDATE Masters
                    SET 
                        Description = @description,
                        Date = @date,
                        UpdatedAt = GETDATE()
                    WHERE Id = @masterId AND UserId = @userId;
                    SELECT @@ROWCOUNT AS AffectedRows;
                `);

            if (result.recordset[0].AffectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found or access denied'
                });
            }

            // Get updated master
            const masterResult = await pool.request()
                .input('masterId', masterId)
                .query(`
                    SELECT 
                        Id AS id,
                        Description AS description,
                        CONVERT(VARCHAR(10), Date, 120) AS date,
                        CAST(TotalIncome AS DECIMAL(18,0)) AS totalIncome,
                        CAST(TotalExpense AS DECIMAL(18,0)) AS totalExpense
                    FROM Masters
                    WHERE Id = @masterId
                `);

            res.json({
                success: true,
                message: 'Master updated successfully',
                data: masterResult.recordset[0]
            });

        } catch (error) {
            console.error('Update master error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update master',
                error: error.message
            });
        }
    }

    // Delete master
    async delete(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const masterId = parseInt(req.params.id);

            const result = await pool.request()
                .input('masterId', masterId)
                .input('userId', userId)
                .query(`
                    DELETE FROM Masters
                    WHERE Id = @masterId AND UserId = @userId;
                    SELECT @@ROWCOUNT AS AffectedRows;
                `);

            if (result.recordset[0].AffectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found or access denied'
                });
            }

            res.json({
                success: true,
                message: 'Master deleted successfully'
            });

        } catch (error) {
            console.error('Delete master error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete master',
                error: error.message
            });
        }
    }

    // Export master to PDF
    async exportPDF(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;
            const masterId = parseInt(req.params.id);

            // Get master data
            const masterResult = await pool.request()
                .input('masterId', masterId)
                .input('userId', userId)
                .query(`
                    SELECT 
                        m.Id,
                        m.Description,
                        CONVERT(VARCHAR(10), m.Date, 120) AS Date,
                        CAST(m.TotalIncome AS DECIMAL(18,0)) AS TotalIncome,
                        CAST(m.TotalExpense AS DECIMAL(18,0)) AS TotalExpense,
                        u.Name AS UserName
                    FROM Masters m
                    JOIN Users u ON m.UserId = u.Id
                    WHERE m.Id = @masterId AND m.UserId = @userId
                `);

            if (masterResult.recordset.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Master not found'
                });
            }

            const master = masterResult.recordset[0];

            // Get details
            const detailsResult = await pool.request()
                .input('masterId', masterId)
                .query(`
                    SELECT 
                        Description,
                        CONVERT(VARCHAR(10), Date, 103) AS Date,
                        CAST(Amount AS DECIMAL(18,0)) AS Amount,
                        Type
                    FROM Details
                    WHERE MasterId = @masterId
                    ORDER BY Date ASC
                `);

            const details = detailsResult.recordset;
            const balance = master.TotalIncome - master.TotalExpense;

            // Create PDF
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            let currentY = 20;

            // Header
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('LAPORAN KEUANGAN', pageWidth / 2, currentY, { align: 'center' });

            currentY += 10;
            doc.setFontSize(12);
            doc.text(master.Description, pageWidth / 2, currentY, { align: 'center' });

            currentY += 8;
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Tanggal: ${this.formatDate(master.Date)}`, pageWidth / 2, currentY, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            currentY += 12;

            // Summary Boxes
            const boxWidth = (pageWidth - (margin * 2) - 8) / 3;
            const boxHeight = 18;

            // Pemasukan Box
            doc.setFillColor(232, 248, 240);
            doc.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'F');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text('TOTAL PEMASUKAN', margin + 4, currentY + 6);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(39, 174, 96);
            doc.text(`Rp ${master.TotalIncome.toLocaleString('id-ID')}`, margin + 4, currentY + 14);

            // Pengeluaran Box
            doc.setFillColor(253, 234, 232);
            doc.roundedRect(margin + boxWidth + 4, currentY, boxWidth, boxHeight, 2, 2, 'F');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text('TOTAL PENGELUARAN', margin + boxWidth + 8, currentY + 6);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(231, 76, 60);
            doc.text(`Rp ${master.TotalExpense.toLocaleString('id-ID')}`, margin + boxWidth + 8, currentY + 14);

            // Saldo Box
            doc.setFillColor(232, 244, 253);
            doc.roundedRect(margin + (boxWidth + 4) * 2, currentY, boxWidth, boxHeight, 2, 2, 'F');
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text('SALDO', margin + (boxWidth + 4) * 2 + 4, currentY + 6);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(74, 144, 217);
            doc.text(`Rp ${balance.toLocaleString('id-ID')}`, margin + (boxWidth + 4) * 2 + 4, currentY + 14);

            doc.setTextColor(0, 0, 0);
            currentY += boxHeight + 10;

            // Details Table Title
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Detail Transaksi', margin, currentY);

            currentY += 8;
            doc.setLineWidth(0.5);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 10;

            // Table Data
            const tableData = details.map(detail => {
                const isIncome = detail.Type === 'income';
                return [
                    detail.Date,
                    detail.Description,
                    isIncome ? 'Pemasukan' : 'Pengeluaran',
                    `${isIncome ? '+' : '-'} Rp ${detail.Amount.toLocaleString('id-ID')}`
                ];
            });

            doc.autoTable({
                startY: currentY,
                head: [['Tanggal', 'Deskripsi', 'Tipe', 'Nominal (Rp)']],
                body: tableData,
                margin: { left: margin, right: margin },
                headStyles: {
                    fillColor: [74, 144, 217],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 10,
                    halign: 'center'
                },
                bodyStyles: {
                    fontSize: 9,
                    cellPadding: 4
                },
                columnStyles: {
                    0: { cellWidth: 30, halign: 'center' },
                    1: { cellWidth: 'auto', halign: 'left' },
                    2: { cellWidth: 35, halign: 'center' },
                    3: { cellWidth: 50, halign: 'right' }
                },
                alternateRowStyles: {
                    fillColor: [248, 249, 250]
                },
                styles: {
                    lineColor: [200, 200, 200],
                    lineWidth: 0.1
                },
                didParseCell: function(data) {
                    if (data.column.index === 2 && data.cell.text[0] === 'Pemasukan') {
                        data.cell.styles.textColor = [39, 174, 96];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.column.index === 2 && data.cell.text[0] === 'Pengeluaran') {
                        data.cell.styles.textColor = [231, 76, 60];
                        data.cell.styles.fontStyle = 'bold';
                    }
                    if (data.column.index === 3) {
                        const text = data.cell.text[0] || '';
                        if (text.startsWith('+')) {
                            data.cell.styles.textColor = [39, 174, 96];
                        } else if (text.startsWith('-')) {
                            data.cell.styles.textColor = [231, 76, 60];
                        }
                    }
                }
            });

            // Footer
            const finalY = doc.lastAutoTable.finalY + 20;
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.setFont('helvetica', 'italic');
            doc.text('Dibuat dengan Finance Tracker', margin, finalY);
            doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth - margin, finalY, { align: 'right' });

            // Send PDF
            const pdfBuffer = doc.output('arraybuffer');
            const filename = `Laporan_Keuangan_${master.Description.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(Buffer.from(pdfBuffer));

        } catch (error) {
            console.error('Export PDF error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to export PDF',
                error: error.message
            });
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Get dashboard stats
    async getDashboardStats(req, res) {
        try {
            const pool = await getPool();
            const userId = req.user.userId;

            const result = await pool.request()
                .input('userId', userId)
                .query(`
                    SELECT 
                        COUNT(DISTINCT m.Id) AS TotalMasters,
                        ISNULL(SUM(m.TotalIncome), 0) AS TotalIncome,
                        ISNULL(SUM(m.TotalExpense), 0) AS TotalExpense,
                        ISNULL(SUM(m.TotalIncome) - SUM(m.TotalExpense), 0) AS Balance,
                        COUNT(d.Id) AS TotalTransactions
                    FROM Masters m
                    LEFT JOIN Details d ON m.Id = d.MasterId
                    WHERE m.UserId = @userId
                `);

            res.json({
                success: true,
                data: result.recordset[0]
            });

        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get dashboard stats',
                error: error.message
            });
        }
    }
}

module.exports = new MasterController();
