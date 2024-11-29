import request from "supertest";
import app from "../index";
import fs from "fs";
import path from "path";

const mockCsvData = [
    { "postId": "100", "id": "1", "name": "Test User 1", "email": "user1@example.com", "body": "Test body 1" },
    { "postId": "101", "id": "2", "name": "Test User 2", "email": "user2@example.com", "body": "Test body 2" },
    { "postId": "102", "id": "3", "name": "Test User 3", "email": "user3@example.com", "body": "Test body 3" },
];

const cleanupUploadedFile = (filePath: string) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

describe("CSV Upload and Pagination API", () => {
    let testFilePath: string;

    beforeEach(() => {
        testFilePath = path.join(__dirname, "test.csv");
        const csvContent = `postId,id,name,email,body\n${mockCsvData.map(row => Object.values(row).join(",")).join("\n")}\n`;
        fs.writeFileSync(testFilePath, csvContent);
    });

    afterEach(() => {
        cleanupUploadedFile(testFilePath);
    });

    it("should upload a valid CSV file and process it", async () => {
        const response = await request(app)
            .post("/upload")
            .attach("file", testFilePath);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("File uploaded and processed successfully!");
    });

    it("should return error if non-CSV file is uploaded", async () => {
        const invalidFilePath = path.join(__dirname, "test.txt");
        fs.writeFileSync(invalidFilePath, "This is a text file");

        const response = await request(app)
            .post("/upload")
            .attach("file", invalidFilePath);

        cleanupUploadedFile(invalidFilePath);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Only CSV files are allowed!");
    });

    it("should return paginated data for valid page and limit", async () => {
        // 上传 CSV 文件
        await request(app).post("/upload").attach("file", testFilePath);

        // 测试分页查询
        const response = await request(app).get("/data?page=1&limit=2");

        expect(response.status).toBe(200);
        expect(response.body.currentPage).toBe(1);
        expect(response.body.totalItems).toBe(mockCsvData.length);
        expect(response.body.totalPages).toBe(2);
        expect(response.body.data.length).toBe(2);  // 返回两条数据
        expect(response.body.data).toEqual(mockCsvData.slice(0, 2));
    });

    it("should return an error for invalid pagination parameters", async () => {
        const response = await request(app).get("/data?page=-1&limit=0");

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Invalid pagination parameters.");
    });

    it("should return an empty array for a page out of range", async () => {
        // 上传 CSV 文件
        await request(app).post("/upload").attach("file", testFilePath);

        const response = await request(app).get("/data?page=10&limit=5");

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);  // 数据为空
    });
});
