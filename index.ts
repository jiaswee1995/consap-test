const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 配置文件上传路径和规则
const upload = multer({ dest: "uploads/" });

// 存储解析后的 CSV 数据
let csvData: any = [];

// 上传 CSV 文件接口
app.post("/upload", upload.single("file"), (req: any, res: any) => {
    const filePath = req.file.path;

    // 验证文件类型
    if (path.extname(req.file.originalname).toLowerCase() !== ".csv") {
        return res.status(400).json({ error: "Only CSV files are allowed!" });
    }

    // 解析 CSV 文件
    const tempData: any = [];
    fs.createReadStream(filePath)
        .pipe(iconv.decodeStream('utf-8'))  // 清除 BOM
        .pipe(csvParser())
        .on("data", (row: any) => {
            tempData.push(row); // 每一行作为一个对象存入
        })
        .on("end", () => {
            csvData = tempData; // 保存到全局变量
            fs.unlinkSync(filePath); // 删除临时文件
            res.json({ message: "File uploaded and processed successfully!" });
        })
        .on("error", (err: any) => {
            res.status(500).json({ error: "Error parsing CSV file." });
        });
});

// 分页接口
app.get("/data", (req: any, res: any) => {
    const { page = "1", limit = "10" } = req.query;

    // 校验分页参数
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
        return res.status(400).json({ error: "Invalid pagination parameters." });
    }

    // 分页逻辑
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const pagedData = csvData.slice(startIndex, endIndex);

    res.json({
        currentPage: pageNum,
        totalItems: csvData.length,
        totalPages: Math.ceil(csvData.length / limitNum),
        data: pagedData,
    });
});

// 启动服务器
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// 导出 app 实例以供测试
export default app;