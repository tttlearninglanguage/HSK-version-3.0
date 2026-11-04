# Bài đọc HSK 2 — phiên bản 2

75 bài mới cho 15 Unit, mỗi Unit 5 tình huống khác nhau và mỗi bài 6 câu hỏi: tổng cộng 450 câu. Mỗi đoạn có 167–217 chữ Hán (không tính dấu câu), dài hơn tất cả các đoạn HSK 1 phiên bản 2 hiện có. Nội dung có bản dịch Việt, pinyin đầy đủ, đáp án, lựa chọn nhiễu và dẫn chứng giải thích.

## Biên tập và phạm vi

Bản thảo là nội dung hư cấu do trợ lý viết, không lấy một truyện rồi chỉ thay tên nhân vật. Các tình huống gồm nhờ giúp, gọi điện, đón người thân, tìm lớp, chọn phương tiện, mua vé, cùng làm việc nhà, thử cách học, đổi kế hoạch, quà tặng, sinh nhật, vận động, mua sắm, lịch hẹn, kiểm tra, chăm sóc người thân, thời tiết, chuyển chỗ ở và chia tay.

Phạm vi dùng toàn bộ từ vựng HSK 1 và phần HSK 2 từ Unit 1 đến Unit hiện tại. Kiểm tra áp dụng cho cả đoạn đọc, câu hỏi và tất cả lựa chọn. Một số dạng đã học được ghi riêng với nguồn: tên 李文/họ 李 từ HSK 1 Unit 2; 一样 từ công thức Unit 9; 相比/比起 từ Unit 12; 出来 từ bổ ngữ xu hướng Unit 5; 支 từ câu ví dụ từ 笔 ở Unit 10; 跳 là phần động từ của 跳舞 ở Unit 14 khi dùng mẫu thời lượng V+O+V+thời gian đã học ở Unit 9. Không thêm các mục này vào danh sách từ cần học.

Mẫu câu được rà trực tiếp theo tiến trình: 是……的, kiêm ngữ và 吧 ở Unit 1; đề nghị 还是……吧 và số ước lượng ở Unit 2; kết quả và lặp động từ từ Unit 3; trải nghiệm 过/因为……所以 từ Unit 4; hướng di chuyển từ Unit 5; 地 và lặp tính từ từ Unit 6; 得 và 一……就 từ Unit 7; 比/虽然……但是 từ Unit 8; 一样/离/thời lượng từ Unit 9; sắp xảy ra và lựa chọn từ Unit 10; 着/最 từ Unit 11; so sánh mở rộng từ Unit 12; trao/tặng và chênh lệch số lượng ở Unit 13; tồn tại/xuất hiện và hướng di chuyển ở Unit 14; lượt hành động và ôn tập ở Unit 15. Mỗi bài có thể ôn các mẫu trước đó; không bắt mọi bài dùng toàn bộ mục lý thuyết trong Unit.

Kiểm tra từ vựng là tự động, còn tính tự nhiên, mạch truyện, phạm vi mẫu câu và bản dịch được biên tập trực tiếp. Báo cáo không tuyên bố máy tự chứng minh toàn bộ ngữ pháp. Bộ chia từ thử các cách tách hợp lệ để tránh nhầm `有时间` thành `有时` + `间`. Các lựa chọn nhiễu ưu tiên cùng loại số lượng, tuổi, giá, giờ, thứ hoặc màu; câu hỏi gồm thông tin trực tiếp, phủ định và một số suy luận ngắn như thời lượng từ hai mốc giờ.

## Tệp và tạo lại

- `readings-v2.txt`: bản thảo dễ đọc; mỗi khối gồm tiêu đề, đoạn tiếng Trung, dòng `VI:` và sáu dòng `câu hỏi|đáp án|nhóm lựa chọn|dẫn chứng tùy chọn|ba phương án nhiễu viết tay tùy chọn`.
- `readings-v2.json`: dữ liệu đã biên dịch, đồng bộ vào `HSK2_UPDATE.readings` trong HTML để website vẫn chạy tĩnh.
- `readings-v2-audit.json`: độ dài, hash văn bản và nguồn/Unit xuất hiện đầu tiên của các từ đã dùng trong từng bài.
- `readings-v1.archive.json`: bản lưu 75 bài cũ, không dùng thay nội dung mới.

```sh
python scripts/build-hsk2-readings.py
node tests/hsk2-diverse-readings.cjs
```

Từ điển hiện có được giữ nguyên và thêm bốn mục phục vụ dữ liệu: 李文, 李 từ bộ tra từ đã đối chiếu ở HSK 1, và 跳 từ từ vựng 跳舞 của Unit 14. Pinyin của đoạn, câu hỏi và lựa chọn được kiểm tra không còn chữ thiếu dữ liệu tra từ. Thêm cụm `有时间` (有 + 时间 đều đã học) để bộ tra từ không tách nhầm thành 有时 + 间 và hiện sai nghĩa “đôi khi”. Không gọi dịch vụ ngoài khi học.

## Kết quả và giao diện

Giữ nguyên thẻ chọn bài, nội dung một khung, pinyin ruby, tra từ, hiện/ẩn dịch, nghe/dừng và chấm điểm. ID thẻ giữ nguyên để không đổi vị trí chọn bài; revision và ID câu hỏi mới giúp không tính nhầm đáp án cũ. Khi trả lời nội dung mới lần đầu, bản ghi cũ được lưu vào `archivedReadingProgress`, không xóa lịch sử tổng hợp hoặc tiến độ từ vựng.

Kiểm thử chạy đủ 450 câu ở từng kích thước 1440/390px, gồm một đáp án sai, kết quả độc lập, trạng thái sau tải lại và giữ dữ liệu cũ. Mọi bài đều dài hơn đoạn dài nhất của HSK 1. Kiểm tra độ trùng cụm bốn chữ trong từng Unit để phát hiện hồi quy kiểu chỉ đổi tên, không coi đây là bằng chứng thay cho việc đọc biên tập nội dung.
