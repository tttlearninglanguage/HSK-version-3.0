# HSK 1 — Chọn bài đọc độc lập

## Phạm vi

Chế độ “Đọc hiểu theo đoạn / Đọc hiểu mở rộng” mở màn hình 5 thẻ lựa chọn, không còn chạy nối tiếp từ đoạn 1 đến đoạn 5. Người học chọn thẳng bất kỳ bài nào ngay từ đầu. Trang chọn bài có nút về Trò chơi của đúng Unit; trang làm bài và trang kết quả đều có nút về danh sách. Kết thúc một bài không tự mở bài tiếp theo. Bài đã hoàn thành có thể mở “Xem lại”, xem lại đáp án/giải thích mà không ghi thêm lịch sử hay làm mất điểm đã lưu.

Dữ liệu thực tế `HSK_READING` có **75 bài đọc: cả 15 Unit đều có đúng 5 bài, mỗi bài 6 câu hỏi**. Không có Unit thiếu/thừa bài; không thêm bài đọc hoặc câu hỏi giả. Bộ chọn lấy tiêu đề/số câu từ dữ liệu, dùng tên dự phòng nếu thiếu tiêu đề; nếu số bài khác 5, hiển thị số thực tế và thông báo.

## Cách triển khai

Mã mới nằm trong khối `HSK1_READING_PICKER_START/END` cuối `HSK1/index.html`:

- CSS giới hạn vào các lớp `reading-picker`/`reading-choice`; lưới 3 cột trên màn hình rộng, 2 cột ở chiều rộng trung bình, 1 cột trên điện thoại. Thẻ nền trắng, CTA theo màu Unit; màu tím không dùng cho CTA.
- `startPassages()` mở danh sách. `HSKReadingPicker.open(unit,id)` tạo session chỉ chứa bài đã chọn. Điều hướng câu hỏi chỉ chạy trong bài đó, không tăng chỉ số sang bài khác.
- Tái sử dụng toàn bộ chuỗi renderer đoạn văn hiện tại, bao gồm pinyin, từ điển tích hợp, từ ngoài Unit, popup gần từ được bấm, câu hỏi/đáp án có thể tra từ và loa.
- Tiến độ được ghi sau mỗi câu trả lời, kể cả khi rời màn hình hoặc tải lại. Câu đã trả lời được khôi phục với phản hồi để tránh tính điểm hai lần. Hoàn thành ngay khi đã trả lời đủ số câu thực tế.
- Thêm một mục lịch sử có `readingId` và tổng câu thực tế khi hoàn thành bài, chỉ ghi một lần. Không ghi lịch sử mới khi xem lại.

Ngoài khối mới, toàn bộ mã nguồn HSK 1 trước thay đổi được giữ nguyên từng ký tự. Không chỉnh sửa nội dung bài đọc/câu hỏi, Grammar Mastery, từ vựng, flashcard, 24 chủ đề, các game khác, trang chủ tổng hoặc HSK 2–4.

## Lưu tiến độ và tương thích

Khóa riêng `hsk1-reading-progress-v1`, schema 1, có `readings[readingId]` với `unitId`, `readingId`, `status`, các đáp án đã nộp, vị trí câu hỏi, `answered`, `correct`, `lastStudiedAt` và thời điểm hoàn thành. Các khóa học tập cũ giữ nguyên. Không yêu cầu backend, tài khoản, framework hoặc build.

Nguồn cũ chỉ lưu lịch sử tổng hợp 30 câu sau cả 5 đoạn; trạng thái session đang làm chỉ ở bộ nhớ. Không có dữ liệu đáng tin cậy để phân bổ chính xác điểm/đáp án về từng bài. Bản mới **giữ nguyên lịch sử đó**, hiện ghi chú tương thích ở danh sách Unit liên quan và bắt đầu ghi chi tiết từng bài từ các lượt học mới. Không tự bịa điểm hay đáp án từng bài từ điểm tổng. Giá trị khóa mới khác schema/không đọc được được giữ nguyên và có cảnh báo.

## Kiểm tra đã chạy

- `node tests/hsk1-reading-picker.cjs`: 75 bài ở tất cả 15 Unit trên Chromium 1440px/390px. Mở bài 5 trước bài 1–4; chuyển giữa hai bài đang làm; tải lại và tiếp tục; làm đủ các câu của từng bài theo thứ tự bài đảo ngược; kiểm tra điểm/trạng thái, không tự chuyển bài, xem lại không nhân đôi lịch sử, về đúng Unit, giữ lịch sử cũ và dữ liệu đọc nguyên vẹn.
- Kiểm tra popup tra từ ngoài từ vựng Unit hiện tại, nghĩa/pinyin, vị trí sát từ trên máy tính/điện thoại; tra từ trong câu hỏi; bật pinyin; lệnh phát âm; nội dung câu hỏi và lời giải.
- Kiểm tra cột lưới, không tràn ngang, mở danh sách từ trang đang cuộn; kiểm tra nhanh Grammar Mastery, flashcard, game từ vựng và 24 chủ đề.
- `node tests/course-navigation.cjs`: 64 kiểm tra điều hướng HSK 1–4, tài nguyên chung, lưu tiến độ và đường dẫn GitHub Pages có tiền tố repository đạt.
- Đối chiếu nguyên trạng phần HTML ngoài module mới; kiểm tra cú pháp JS và `git diff --check` đạt. Đã xem ảnh trang chọn bài trên máy tính/điện thoại.

Chưa kiểm thử Safari/iPhone/Mac thật, VoiceOver hoặc âm thanh thực tế của hệ điều hành. Kiểm thử loa xác nhận lệnh phát với dữ liệu đọc gốc, không xác nhận đầu ra âm thanh trên mọi thiết bị.
