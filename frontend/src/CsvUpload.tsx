import React, { useState, useEffect } from 'react';
import { Upload, Button, Table, Pagination, message } from 'antd';
import { RcFile } from 'antd/es/upload/interface';
import axios from 'axios';

const CsvUpload: React.FC = () => {
    const [data, setData] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);

    const handleFileChange = (info: any) => {
        const { status, originFileObj } = info.file;
        // Check for 'done' status or handle error
        if (status === 'done') {
            console.log('Upload successful:', originFileObj);
            uploadCSV(originFileObj);
        } else if (status === 'error') {
            console.log('Upload failed:', info.file);
        }
    };

    // Upload CSV to the server
    const uploadCSV = async (file: RcFile) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('http://localhost:3001/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            message.success('File uploaded successfully');
            fetchData(1);
        } catch (error) {
            message.error('File upload failed');
        }
    };

    const fetchData = async (page: number) => {
        try {
            const response = await axios.get('http://localhost:3001/data', {
                params: { page, limit },
            });
            setData(response.data.data);
            setTotal(response.data.totalItems);
        } catch (error) {
            message.error('Error fetching data');
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchData(page);
    };

    useEffect(() => {
        fetchData(1);
    }, []);

    const columns = Object.keys(data[0] || {}).map((key) => ({
        title: key,
        dataIndex: key,
        key: key,
    }));

    return (
        <div>
            <Upload
                accept=".csv"
                action="http://localhost:3001/upload"
                showUploadList={false}
                onChange={handleFileChange}
            >
                <Button>Upload CSV</Button>
            </Upload>

            <Table
                dataSource={data}
                columns={columns}
                pagination={false}
                scroll={{x: 1500}}
                rowKey={(record, index) => index !== undefined ? index.toString() : '0'}
            />

            <Pagination
                current={currentPage}
                pageSize={limit}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
            />
        </div>
    );
};

export default CsvUpload;
