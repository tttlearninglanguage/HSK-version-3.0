# Bài đọc HSK 3 — phiên bản 2

90 đoạn mới cho 18 Unit, mỗi Unit có 5 tình huống riêng và mỗi đoạn 6 câu hỏi (540 câu). Độ dài 233–287 chữ Hán, không tính dấu câu, dài hơn toàn bộ các đoạn HSK 2 phiên bản 2 hiện tại (167–217 chữ). Mỗi đoạn có pinyin, dịch Việt, đáp án và dẫn chứng trong bài.

## Nội dung và phạm vi

Bản thảo được viết theo các mục đích đọc khác nhau: nhận biết người và đồ vật, thư giới thiệu, sinh hoạt gia đình, gọi món, đổi chỗ ở, lựa chọn chuyến đi, quan sát trên tàu, chụp ảnh, mua sắm, chăm sóc người thân, vận động, học tập, xử lý công việc, thời tiết, làm khách, thư viện, biểu diễn, tìm hiểu nơi ở, động vật, quan hệ bạn bè và mục tiêu sau tốt nghiệp. Các bài trong cùng Unit dùng lại từ vựng nhưng có nhân vật, mục đích, thông tin và diễn biến riêng; không tạo năm bản chỉ đổi tên của cùng một truyện.

Phạm vi từ vựng gồm các bài học/chủ đề HSK 1–2, các dạng đã có trong ví dụ/công thức ngữ pháp đã học, và từ HSK 3 từ Unit 1 đến Unit hiện tại. Bộ kiểm tra dùng phương án chia từ hợp lệ để tránh nhầm `有时间` thành `有时` + `间`. Báo cáo lưu nguồn và Unit sớm nhất cho từng từ thực dùng, gồm cả câu hỏi và phương án nhiễu. `拍` được ghi rõ là thành phần động từ của `拍照` ở Unit 5. Mẫu câu, diễn biến và bản dịch được biên tập trực tiếp; kiểm tra từ vựng không được coi là chứng minh tự động toàn bộ ngữ pháp.

Pinyin và nghĩa trong bài đọc có dữ liệu theo ngữ cảnh cho `还` (hái/huán), `得` (de/dé/děi), `只` (zhǐ/zhī), `长` (cháng/zhǎng), `种` (zhǒng) và `了` trong `不了` (liǎo). Không thay cách đọc của các mục từ gốc trong thẻ học. Bộ tra từ đọc dùng đúng cách chia từ đã kiểm tra cho mỗi đoạn/câu hỏi; không gọi dịch vụ ngoài khi người dùng học.

## Tệp nguồn

- `readings-v2.txt`: 90 bản thảo, dịch Việt và sáu câu hỏi/đoạn. Dòng câu hỏi có dạng `câu hỏi|đáp án|nhóm phương án|dẫn chứng tùy chọn|ba phương án nhiễu viết tay tùy chọn`.
- `readings-v2.json`: dữ liệu đồng bộ vào `window.HSK3_UPDATE.readings`; website vẫn chạy tĩnh không cần build khi triển khai.
- `readings-v2-audit.json`: độ dài, hash, phạm vi và nguồn các từ đã dùng.
- `readings-v1.archive.json`, `readings-v1-audit.archive.json`: lưu nội dung và báo cáo cũ để đối chiếu.
- `../reading-helpers.js`: hiển thị token và nghĩa/pinyin theo ngữ cảnh cho giao diện bài đọc.

```sh
python scripts/build-hsk3-readings.py
HSK_DATA_ONLY=1 node tests/hsk3-diverse-readings.cjs
node tests/hsk3-diverse-readings.cjs
node tests/hsk3-readings.cjs
node tests/hsk3-smoke.cjs
```

## Tiến độ và kiểm thử

Giữ 90 ID thẻ đọc, thêm revision 2 và ID câu hỏi mới. Khi bắt đầu trả lời phiên bản mới, kết quả phiên bản cũ được lưu riêng vào `archivedReadingProgress`; tiến độ từ vựng và lịch sử chung được giữ. Một đoạn vẫn có kết quả riêng; chọn làm cả Unit dùng tổng thực tế 30 câu.

Kiểm thử toàn bộ 90 đoạn/540 câu trên 1440px và 390px, gồm pinyin ruby, dịch, tra từ, một đáp án sai, kết quả từng đoạn, tải lại và lưu kết quả cũ. Bộ kiểm tra lượt đầy đủ chạy 18 vòng, mỗi vòng 5 đoạn/30 câu, cùng phần xem lại đáp án. Kiểm tra giao diện chung và nghe/dừng cũng bao gồm HSK 1–4. So sánh cụm bốn chữ phát hiện hồi quy chỉ đổi tên; việc đánh giá đa dạng nội dung vẫn dựa trên đọc biên tập.
