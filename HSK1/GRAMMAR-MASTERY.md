# Grammar Mastery — HSK 1

Bài tập mới tích hợp trực tiếp trong `HSK1/index.html`: dữ liệu JSON `grammar-mastery-data`, CSS `grammar-mastery-style`, logic `grammar-mastery-app`. Không cần backend, framework, API trả phí, đăng nhập hoặc bước build; chạy cùng GitHub Pages hiện tại. Mỗi câu có ID bền vững dạng `u03-g02-q09` (Unit–điểm–câu), liên kết đến đúng mục `HSK_GRAMMAR_UPDATED`.

## Kiểm tra nguồn trước khi triển khai

Nguồn thực tế trên main đã chuyển từ `hsk1.html` sang `HSK1/index.html`. `HSK_GRAMMAR_UPDATED` có đúng **40 điểm** thuộc 15 Unit; Unit 1 không có điểm riêng. Tất cả 40 điểm có công thức, giải thích, mẹo, lưu ý và ví dụ. Lý thuyết gốc và các quiz cũ được giữ nguyên trong mã nguồn để đối chiếu, nhưng các lối vào bài tập ngữ pháp chuyển sang Grammar Mastery.

Các bất thường có sẵn, **không sửa lý thuyết trong đợt này**:

- Unit 9, câu tồn tại: ví dụ `桌子上有/是一本书。` gộp 有 và 是, dù cách dùng phụ thuộc ngữ cảnh. Bài mới phân biệt giới thiệu sự tồn tại bằng 有 và xác định vật/địa điểm bằng 是 trong ngữ cảnh rõ ràng.
- Unit 5 có ví dụ ngày tháng dùng chữ số nhưng pinyin thiếu cách đọc các chữ số; một số ví dụ khác tách âm tiết không nhất quán.
- Unit 12, tiêu đề của trợ từ ngữ khí ghi `了 (lè)`; cách đọc của trợ từ trong bài mới là `le`.
- Unit 15 có hai dòng ghi chú về Unit 9/12 bị đặt trong `examples`; các dòng này thiếu pinyin/nghĩa của ví dụ. Chúng không được dùng làm câu hỏi mới.
- Một số quiz cũ hỏi “ví dụ nào minh họa” và có phương án nhiễu cũng minh họa được cấu trúc. Bộ mới không lấy lại các câu đó nguyên vẹn.

## Phân bổ câu đã biên soạn

| Unit | Điểm | Cấp 1: nhận diện | Cấp 2: sắp xếp | Cấp 3: sửa lỗi | Cấp 4: dịch/biến đổi | Cấp 5: hội thoại | Tổng |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 2 | 1 | 3 | 3 | 3 | 5 | 2 | 16 |
| 3 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 4 | 4 | 12 | 12 | 12 | 20 | 8 | 64 |
| 5 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 6 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 7 | 4 | 12 | 12 | 12 | 20 | 8 | 64 |
| 8 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 9 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 10 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 11 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 12 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 13 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 14 | 3 | 9 | 9 | 9 | 15 | 6 | 48 |
| 15 | 1 | 3 | 3 | 3 | 5 | 2 | 16 |
| **Tổng** | **40** | **120** | **120** | **120** | **200** | **80** | **640** |

Không sinh câu ngẫu nhiên khi mở bài. Các phương án và thứ tự thẻ ban đầu đã được lưu sẵn. Các thẻ giữ nguyên những cụm cần học như `房间里`, `两个小时`, `正在`, `不会`; khi có trạng ngữ thời gian, một số đáp án chuyển thời gian lên đầu câu được lưu thêm. Các câu có từ hỗ trợ chưa nằm trong danh sách từ vựng Unit hiện tại/trước đó được đánh dấu trong mục “Từ hỗ trợ” (102/640 câu có mục này). Pinyin được chuẩn bị offline và đã hiệu chỉnh các trường hợp đa âm theo ngữ cảnh như `睡…觉` đọc `jiào`, `还` bổ sung đọc `hái`; âm đọc có thể có khác biệt biến điệu/tách từ so với từng giọng đọc thiết bị.

## Chấm điểm minh bạch

- Trắc nghiệm có 4 lựa chọn A–D; sau khi chọn mới hiện đáp án và lý do cho từng lựa chọn.
- Sắp xếp yêu cầu dùng đủ các thẻ, có hoàn tác, bỏ từng thẻ và làm lại. Không gộp các từ trùng thành một thẻ: thẻ được định danh bằng vị trí.
- Dịch, biến đổi, sửa lỗi và hội thoại dùng các đáp án đã lưu. Khoảng trắng, dấu câu và ký tự dạng fullwidth được chuẩn hóa; không tự xóa từ phủ định hoặc chấp nhận câu khác nghĩa.
- Câu nhập chưa khớp không bị kết luận sai bằng một bộ chấm ngữ nghĩa giả. Người học thấy câu mẫu, pinyin, nghĩa và giải thích; chọn “Tôi đối chiếu: đúng” hoặc “Tôi cần ôn lại”, hoặc để chờ đối chiếu. Chấm thủ công được lưu riêng với câu khớp đáp án.
- Kết quả tách câu khớp mẫu, câu tự đối chiếu đúng, câu cần ôn và câu chờ đối chiếu. Câu chờ chưa tính vào mẫu số của tỉ lệ chính xác.
- Loa tái sử dụng `window.speak` của hệ thống hiện tại; kiểm thử chỉ xác nhận lệnh phát, không xác nhận âm thanh trên mọi phần cứng.

## Lưu tiến độ và ôn tập

Khóa mới `hsk1-grammar-mastery-v1`, schema 1, chứa:

- `records`: Unit, điểm, cấp, số lần trả lời/đúng/sai/chờ, trạng thái gần nhất, thời điểm, giai đoạn ôn và hạn ôn.
- `runs`: danh sách ID của lượt, câu hiện tại, đáp án đã nộp, bản nháp nhập liệu và thẻ đã chọn. Vào lại đúng cấp sẽ tiếp tục lượt chưa xong.
- `history`: tối đa 200 lượt gần nhất, bao gồm lượt đã hoàn thành và lượt bỏ dở khi làm lại.

Không đổi schema hay ghi đè các khóa HSK đang có, nên không cần di trú kết quả cũ. Các kết quả `grammar-updated` cũ vẫn còn trong lịch sử học trước đây; không suy diễn chúng thành hoàn thành các cấp độ mới. Nếu dữ liệu Mastery không hợp lệ/khác schema, giữ nguyên giá trị cũ và cảnh báo không lưu; nếu localStorage đầy/không khả dụng, cho phép tiếp tục trong bộ nhớ và báo rõ.

Sau một câu sai, gợi ý ôn sau **1 ngày**. Trả lời đúng trong lượt ôn chuyển sang khoảng cách **3 ngày**, rồi **7 ngày**; đúng lần tiếp theo kết thúc chu kỳ. Sai lại đặt về lịch 1 ngày. Có thể chọn ôn sớm tất cả câu cần ôn, hoặc chỉ ôn câu đến lịch. Câu có nhiều lần sai được ưu tiên; không gửi thông báo hoặc tạo lịch bên ngoài.

## Kiểm thử

```sh
node tests/hsk1-grammar-mastery.cjs
node tests/course-navigation.cjs
node tests/hsk-flashcard-panels.cjs
```

Bộ Mastery kiểm tra tự động 40 điểm, 640 câu, phân bổ 3–3–3–5–2, ID/yêu cầu không trùng, liên kết đúng, dữ liệu không rỗng, đủ lựa chọn và khả năng ghép thẻ. Chromium giải tất cả 640 câu ở 1440px và 390px, kiểm tra giải thích không hiện trước đáp án, chuẩn hóa dấu câu, chọn cấp, lưu/khôi phục bản nháp, giữ dữ liệu cũ, phân biệt chờ đối chiếu, lịch ôn đủ 1–3–7 ngày, lệnh phát âm và những chức năng HSK 1 cũ. Ngoài khối mới được thêm, mã nguồn HSK 1 hiện có giữ nguyên từng ký tự.

## Cần kiểm tra thủ công khi duyệt

Kiểm thử cấu trúc không chứng minh mọi cách diễn đạt tiếng Trung đều là đáp án duy nhất. Nên đọc rà soát sư phạm toàn bộ ngân hàng, đặc biệt các sắc thái 呢/了, câu tồn tại 有/是, động từ ly hợp và những đáp án viết hợp lý chưa nằm trong danh sách. Các câu nhập ngoài whitelist cần tự đối chiếu, không có AI chấm nghĩa. Chưa thử thao tác gõ bằng bàn phím tiếng Trung/VoiceOver và âm thanh trên iPhone hoặc Mac thật; trình duyệt tự động dùng Chromium và loa được mock. Không thay đổi nội dung HSK 2, HSK 3, HSK 4.
