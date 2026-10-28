# HSK 1 Learning Quest — bản mở rộng chức năng (chưa đạt toàn bộ đặc tả)

## Cài đặt GitHub Pages
Giải nén và tải toàn bộ file vào thư mục gốc repository GitHub, giữ `index.html`, `app.js`, `upgrade.js`, `style.css`, `data/lessons.js` cùng cấu trúc. Bật Settings → Pages → Deploy from a branch → main / (root).

## Nội dung và tính năng đã có
- 15 bài, 338 lượt từ trong sổ tay DOCX, gồm Hán tự, Pinyin từ, nghĩa, câu ví dụ và bản dịch.
- Ngữ pháp giáo trình và phần mở rộng theo tài liệu.
- Tra cứu từ, ẩn Pinyin/nghĩa, đánh dấu đã thuộc, flashcard, nghe bằng speech synthesis.
- 13 mục chế độ luyện tập trong giao diện: 6 chế độ từ vựng ban đầu và 7 chế độ bổ sung (điền từ, dịch câu, xếp câu, đọc hiểu câu, luyện nói, ngữ pháp, hỗn hợp).
- Nhận dạng giọng nói nếu trình duyệt hỗ trợ; nhập câu thủ công khi không hỗ trợ.
- Ôn tập nhiều bài, lịch sử, xuất/nhập tiến độ JSON, lưu localStorage.

## Giới hạn quan trọng — chưa phải bản hoàn chỉnh theo master prompt
- **Chưa có** 5 bài đọc dài 120–200 chữ Hán và 30 câu đọc hiểu/bài; mục đọc hiểu hiện là đọc hiểu câu ví dụ.
- **Chưa có** 30 đề viết đoạn văn/bài và đề thi cuối khóa 100 câu.
- **Chưa có** 30 câu *độc lập* mỗi chế độ/bài; không bịa thêm câu hỏi để đạt số lượng.
- **Chưa có** Pinyin câu ví dụ, loại từ đầy đủ, hoặc 3–5 ví dụ cho mỗi điểm ngữ pháp (nguồn DOCX không cung cấp).
- Các chế độ gõ, nói, dịch câu chấm bằng khớp văn bản với đáp án mẫu, không chấm ngữ nghĩa, ngữ pháp hay phát âm thực sự. Bài đọc hiểu câu và ngữ pháp chỉ cho tự đối chiếu.
- Các bài có mục từ trùng giữa bài vẫn giữ nguyên nguồn.
- Sử dụng speech synthesis và nhận dạng giọng nói của trình duyệt, phụ thuộc môi trường và quyền micro.

## Kiểm tra kỹ thuật
`node --check app.js` và `node --check upgrade.js`. Mở trang qua GitHub Pages hoặc máy chủ tĩnh để kiểm tra thao tác trình duyệt. Không có kiểm thử end-to-end trên Chrome/Edge thực tế trong môi trường tạo mã này.
