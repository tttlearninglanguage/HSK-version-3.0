# Bài đọc HSK 4 — phiên bản 2

Biên tập lại toàn bộ 50 đoạn của Bài 1–10, mỗi bài học vẫn có 5 đoạn độc lập × 5 câu hỏi, tổng cộng 250 câu. Đoạn mới dài 238–279 chữ Hán, không tính dấu câu. Có bản dịch Việt đầy đủ, pinyin theo từ và dẫn chứng cho từng đáp án.

## Tình huống và cách đọc

| Bài | Năm nội dung được tách riêng |
| --- | --- |
| 1 | Lịch tân sinh viên; thư lựa chọn chuyên ngành; nhật ký giao lưu; đối chiếu hai học bổng; phỏng vấn người làm phiên dịch |
| 2 | Tin cho thuê; ghi chép bàn giao; căn phòng nhìn ra chợ; lịch dùng bếp; tính chi phí tháng đầu |
| 3 | Hai lượt giao một đơn sách; thanh toán khi mạng chậm; hướng dẫn đặt vé; quyền truy cập ứng dụng; kiện hàng gửi nhầm |
| 4 | Thông báo tìm chủ túi; hành trình xe đón nhiều điểm; thư cảm ơn chuyển hoa; chi phí đi lại; ca giao bữa sáng |
| 5 | Đọc thực đơn theo nhu cầu; công thức được điều chỉnh; thẻ chỗ ngồi; quan sát đồ ăn thừa; phân biệt ba cách nói về ăn cay |
| 6 | Nhật ký đi viện theo giờ; sửa thông tin trên phiếu; lời nhắn khi bạn ngủ; hội thoại tái khám; quan sát ở quầy hướng dẫn |
| 7 | So sánh câu hỏi khảo sát; bàn giao trước công tác; phỏng vấn người không mua; nhật ký hoàn thành công việc; thử hai cách hướng dẫn |
| 8 | So sánh hai nơi đi chơi; khoảng giờ không cần trả lời ngay; ngắm một bức tranh; cuộc hẹn nghỉ ngơi; quan sát thành phố qua ba giờ |
| 9 | Lá thư về tấm thiệp; hai bạn ở hai thành phố; phân công buổi gặp; đổi ngày dùng quà; hai chiếc ghế của ông bà |
| 10 | Thư chuẩn bị chuyến đi; ghi nhiệt độ hai nơi; thu âm phương ngữ; thông báo mượn cốc; khảo sát hướng dẫn phân loại rác |

Không bắt mỗi đoạn kết thúc bằng một bài học đạo đức. Câu hỏi thay đổi theo văn bản: thông tin, trình tự, điều kiện, phủ định, so sánh, tính toán, bằng chứng, nghĩa trong ngữ cảnh và suy luận. Không cố định câu thứ tư thành câu hỏi ý chính. Các phép tính có giải thích Việt, kể cả mốc nhiệt độ âm và khoản tiền mua một lần.

## Phạm vi và tra từ

Phạm vi đối chiếu gồm bài học, chủ đề và ví dụ HSK 1–3; từ/ví dụ và mẫu ngữ pháp HSK 4 đến bài hiện tại. Một số dạng rút gọn đã có trong ví dụ được ghi nguồn riêng: `窗` trong ví dụ từ 靠, `盐` trong ví dụ từ 克, `项` trong ví dụ từ 进展; `拍/照/跳` là thành phần động từ đã học. Các tên nhân vật 小林、小陈、小王、小周 được ghi rõ là tên hư cấu, không tính thành mục từ mới.

Kiểm tra từ vựng áp dụng cả đoạn, câu hỏi và phương án nhiễu. Bộ chia từ thử các cách tách hợp lệ; mỗi mục thực dùng có nguồn và bài sớm nhất trong báo cáo. Phạm vi mẫu câu, tính tự nhiên, diễn biến và bản dịch được biên tập trực tiếp; kiểm tra từ vựng không được coi là chứng minh tự động toàn bộ ngữ pháp.

Tra từ trong bài đọc dùng đúng token đã kiểm tra. Nghĩa/cách đọc theo ngữ cảnh được xử lý cho 还、得、只、长、种、转、了 và các từ đa nghĩa 好、等、光、对、过、当. Ví dụ `种` đọc zhòng khi nói trồng hoa, zhǒng khi nói loại; `好` trong lời kể không lấy nghĩa “để/nhằm” của mục ngữ pháp ở bài khác. Phần từ vựng và ví dụ gốc trong khóa học giữ nguyên.

## Tạo lại và kiểm thử

- `readings-v2.txt`: bản thảo, dịch Việt và năm câu hỏi/đoạn. Dòng câu hỏi: `loại|câu hỏi|đáp án/ba phương án nhiễu|dẫn chứng|giải thích Việt tùy chọn`. Hai mốc dẫn chứng có thể nối bằng `~~` để trích cả phần cần thiết cho phép tính.
- `readings-v2.json`: toàn bộ 50 đoạn đã biên dịch; nội dung tương ứng được ghi vào `data/practice-01.json` đến `practice-10.json`.
- `readings-v2-audit.json`: độ dài, hash, nguồn và phạm vi từ vựng.
- `readings-v1.archive.json`: lưu 50 đoạn cũ để đối chiếu, không hiển thị thay cho bản mới.

```sh
python scripts/build-hsk4-readings.py
HSK_DATA_ONLY=1 node tests/hsk4-diverse-readings.cjs
node tests/hsk4-diverse-readings.cjs
node tests/hsk4-upper-content.cjs
node tests/hsk4-upper-browser.cjs
node tests/hsk4-reading-answer-grid.cjs
```

Giữ ID và đường dẫn của 50 thẻ. ID câu hỏi mới có `v2`; kết quả đọc mới lưu `readingRevision: 2`. Lịch sử cũ vẫn nằm trong `history`, nhưng không đánh dấu hoàn thành hay lấy điểm cũ cho đoạn đã biên tập. Tiến độ từ vựng, bài viết và dữ liệu HSK 1–3 không bị xóa.

Kiểm thử chạy hết 250 câu trên desktop/mobile, gồm một câu sai, dữ liệu tra từ/pinyin, bản dịch, kết quả độc lập, tải lại và phân biệt kết quả cũ/mới. Bộ kiểm tra chung còn chạy các chế độ học cho đủ 10 bài, nhập/xuất tiến độ, điều hướng và ngữ pháp. Lưới đáp án được kiểm tra ở 1440/900/390/360px; một nhãn dài trong kiểm thử kiểm tra nhánh một cột mà không sửa nội dung thật. Kiểm tra độ trùng cụm chữ chỉ nhằm phát hiện hồi quy dùng mẫu; không thay cho việc đọc đánh giá nội dung.
