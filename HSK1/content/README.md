# Bài đọc HSK 1 — phiên bản 2

75 bài do trợ lý biên soạn: 15 Unit × 5 bài, mỗi bài 6 câu hỏi (450 câu). Mỗi bài có văn bản tiếng Trung, bản dịch Việt, đáp án, phương án nhiễu và câu dẫn chứng giải thích. Bài hội thoại xuống dòng theo người nói; bài kể, lịch sinh hoạt và lời nhắn dùng văn xuôi.

## Nguồn và biên tập

- `readings-v2.txt`: bản thảo có thể chỉnh sửa. Mỗi khối bắt đầu bằng `@Unit/Tên bài`, tiếp theo là tiếng Trung, dòng `VI:` và sáu dòng `câu hỏi|đáp án|nhóm đáp án|dẫn chứng tùy chọn`.
- `readings-v2.json`: dữ liệu đã biên dịch, đồng bộ vào `window.HSK_READING` trong HTML; trang vẫn chạy tĩnh, không tải nội dung qua API.
- `readings-v2-audit.json`: từ/cụm từ đã dùng, Unit xuất hiện đầu tiên và mã kiểm tra văn bản cho từng bài. Kiểm tra bao gồm đoạn đọc, câu hỏi và tất cả lựa chọn.
- `readings-v1.archive.json`: lưu nguyên 75 bài cũ để đối chiếu lịch sử; không hiển thị thay cho bài mới.

Vốn từ được lấy từ `HSK_LESSONS` từ Unit 1 đến Unit hiện tại. Tên 李文 được phép từ Unit 2 vì có trong tên bài “我叫李文”. Không thêm tên người hoặc từ vựng ngoài phạm vi này để kéo dài đoạn đọc. Unit 1 chỉ có các cách chào/cảm ơn/tạm biệt nên dùng năm ngữ cảnh giao tiếp ngắn khác nhau; từ Unit 3–15 tăng dần nội dung gia đình, công việc, lịch sinh hoạt, địa điểm, học tập, mua sắm, thời tiết, sức khỏe, gọi món, trải nghiệm đã qua và đi lại. Không lấy một truyện rồi đổi tên/địa điểm thành năm bài.

Mẫu câu được rà theo chương trình: câu đơn và SVO ở đầu khóa; 是/的/吗 từ Unit 3; 有/số lượng/tuổi từ Unit 4; thời gian và 会 từ Unit 5; 想/liên động/怎么 từ Unit 6; giờ giấc/吧/呢 từ Unit 7; vị trí/在/能 từ Unit 8; tồn hiện/thứ tự từ Unit 9; giá tiền/tính từ/怎么样 từ Unit 10; chính phản/đang làm/要 từ Unit 11; thời tiết/đổi trạng thái 了/太……了 từ Unit 12; 可以/一下/hai tân ngữ từ Unit 13; hành động đã hoàn thành 了/都 từ Unit 14; kết hợp các nội dung cũ và đi lại ở Unit 15. Một số từ đã có ở Unit sớm hơn được dùng với nghĩa SVO cơ bản, không đợi đến mục hệ thống hóa ngữ pháp sau.

Các lựa chọn nhiễu được lấy trong phạm vi đã học, ưu tiên cùng loại (tuổi, số lượng, giá tiền, giờ, thứ, nghề nghiệp); chúng được tạo theo thứ tự ổn định để dễ kiểm tra. Câu hỏi sớm dùng điền thông tin theo lượt thoại; các Unit sau kết hợp hỏi người, nơi, thời gian, hoạt động, số lượng và câu hỏi khẳng định/phủ định.

## Tiến độ

Bài mới giữ ID thẻ để liên kết vẫn hoạt động, nhưng có `revision: 2` và ID câu hỏi mới. Kết quả bài cũ không được tính là hoàn thành bài mới. Khi mở bài mới, bản ghi cũ được giữ trong `archivedReadings` của dữ liệu tiến độ riêng; lịch sử học chung không bị xóa.

## Tạo lại và kiểm tra

```sh
python scripts/build-hsk1-readings.py
node tests/hsk1-diverse-readings.cjs
node tests/hsk1-reading-picker.cjs
node tests/hsk1-reading-dictionary.cjs
node tests/hsk1-reading-translations.cjs
```

Kiểm tra từ vựng là tự động; việc tự nhiên/đa dạng và phạm vi mẫu câu được biên tập trực tiếp, không tuyên bố máy tự xác minh ngữ pháp. Bản dịch Việt do trợ lý viết cùng từng bài, không dùng mẫu kết thúc chung của bộ bài cũ.
