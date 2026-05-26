const http = require('http');
const fs = require('fs');
const path = require('path');

// 우리가 접속할 포트 번호입니다.
const PORT = 3000;

// 웹 서버를 생성합니다.
http.createServer((req, res) => {
    // 요청한 주소에 따라 index.html 또는 기타 파일을 찾습니다.
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // 보안 검사: 현재 폴더 바깥의 중요 시스템 파일에 접근하려는 시도를 차단합니다.
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('접근이 거부되었습니다.');
        return;
    }

    // 파일을 읽어서 웹 브라우저로 전송합니다.
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('요청하신 파일을 찾을 수 없습니다.');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(`서버 내부 오류: ${err.code}`);
            }
        } else {
            // 파일 확장자에 따라 형식을 브라우저에 알려줍니다.
            let contentType = 'text/html';
            if (filePath.endsWith('.css')) contentType = 'text/css';
            if (filePath.endsWith('.js')) contentType = 'text/javascript';
            res.writeHead(200, { 'Content-Type': contentType + '; charset=utf-8' });
            res.end(content, 'utf-8');
        }
    });
}).listen(PORT, () => {
    // 서버 시작 완료 메시지
    console.log(`[안내] 계산기 웹 서버가 성공적으로 작동 중입니다!`);
    console.log(`[접속 주소] 아래 주소를 브라우저에 입력해 보세요:`);
    console.log(`http://localhost:${PORT}`);
});
