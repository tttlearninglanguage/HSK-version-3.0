# HSK 4 — Bài 1 để duyệt

## Phạm vi và khảo sát hệ thống

Đã kiểm tra cấu trúc repository: trang chủ `index.html`, ba trang học `HSK1/index.html`, `HSK2/index.html`, `HSK3/index.html`, ba tài nguyên giao diện/điều hướng dùng chung, bộ phát âm và năm bộ kiểm thử hiện có. Các cấp 1–3 là HTML độc lập, phần lớn CSS, JavaScript và dữ liệu được nhúng trong HTML; không có backend hay bước build. HSK 3 có 18 bài, 36 chủ đề, các tab từ vựng/ngữ pháp/flashcard/trò chơi, bài đọc có tra từ tại vị trí bấm, ôn tập, lịch sử và sao lưu localStorage. Trang chủ trước đây hiển thị HSK 4 là sắp ra mắt.

HSK 4 theo cùng bố cục, luồng học và các dạng luyện tập đang có ở HSK 3. Dữ liệu và engine mới tách file để mở rộng nhiều bài mà không sao chép trò chơi từng bài. Dùng trực tiếp `../shared/css/hsk-header.css` và `../shared/css/flashcard-compact.css`, cùng `hsk3-theme.css` được trích nguyên CSS của HSK 3 theo đúng thứ tự cascade. `speech.js` kế thừa bộ phát âm `shared/js/hsk-speech.js`, chỉ đổi khóa giọng đọc thành `hsk4-voice` để không dùng chung tùy chọn các cấp trước. Không sửa HTML, CSS, JavaScript hoặc dữ liệu của HSK 1–3. Bộ kiểm thử HSK 3 được sửa bước về trang chủ tổng: bấm đúng liên kết logo và chờ URL đích, thay cho nút về trang chủ nội bộ HSK 3. Không sửa hành vi điều hướng của trang học.

Chỉ mở **Bài 1 — 我们来中国学习了**, quyển Thượng. Bài 2–10 chưa mở theo yêu cầu chờ duyệt. Quyển Hạ gồm Bài 11–20 hiển thị **Sắp ra mắt**, chưa có nguồn, không tạo từ vựng/ngữ pháp cho quyển này. Không đánh số lại Bài 11 thành Bài 1.

## Giao diện đồng bộ HSK 3

Bản sửa giao diện dùng CSS thực tế của HSK 3, không tiếp tục bộ giao diện thẻ màu xanh riêng. Chạy `python scripts/sync-hsk3-theme.py` từ gốc repository khi cần cập nhật bản CSS dẫn xuất. Script chỉ đọc `HSK3/index.html`, không sửa các cấp trước.

- Trang chủ: banner minh họa sách, lối tắt tiến độ/ôn tập và thẻ bài học pastel `qh-*` như HSK 3; giữ riêng hai mục Thượng/Hạ.
- Trong bài: `unit-title-banner`, tab và màu nhận diện của Bài 1 theo mẫu HSK 3.
- Từ vựng: bảng STT / Hán tự / Pinyin / Nghĩa / Ví dụ và dịch / Học; giữ hiển thị loại từ để đáp ứng tài liệu HSK 4. Bảng cuộn trong khung trên màn hình nhỏ.
- Flashcard: dùng trực tiếp CSS compact chung, bộ lọc Tất cả / Đã thuộc / Chưa thuộc, thanh tiến độ, nút Nghe / Trước / Đánh dấu / Trộn thẻ / Tiếp. Trộn thẻ không thay đổi thứ tự dữ liệu nguồn.
- Ngữ pháp: các khung `h2-ref-*` như HSK 3, gồm công thức vàng, giải thích, lưu ý và ví dụ.
- Trò chơi: nhóm từ vựng, nghe/viết, câu/ngữ pháp, đọc đoạn và vận dụng; dùng lại khung câu hỏi, lựa chọn đáp án và chọn giọng đọc.
- Đọc hiểu dùng mẫu HSK 1: danh sách thẻ 3/2/1 cột theo màn hình; màn hình đọc một khung rộng, đoạn văn trên và câu hỏi/lựa chọn bên dưới; tra từ gần vị trí bấm.
- Viết đoạn, ôn tập, thống kê: khung hướng dẫn `answer-area` và các thành phần `dash-*` của HSK 3.

`tests/hsk4-ui-parity.cjs` so sánh trực tiếp kiểu hiển thị được trình duyệt tính toán cho các thành phần của HSK 3 và HSK 4 tại 1440px/390px; đồng thời xác minh file CSS dẫn xuất khớp toàn bộ cascade nguồn. Kiểm tra gồm font, màu, border, bo góc, bóng, cách hiển thị, không tràn ngang, tìm bài, bộ lọc flashcard và thứ tự dữ liệu khi trộn thẻ.

## Nội dung

- Nguồn: tài liệu người dùng gửi `HSK 4 - Thượng.docx`. Bài 1 trong tài liệu đã có tiếng Việt.
- 40 từ theo đúng thứ tự, gồm Hán tự, pinyin, loại từ, nghĩa Việt, câu ví dụ, pinyin câu và bản dịch. Loại từ được diễn giải sang tiếng Việt; ký hiệu gốc lưu riêng để đối chiếu.
- 4 cấu trúc: 任何; 要是; 随着; 一方面……，另一方面……. Giữ công thức, giải thích và 4 ví dụ gốc.
- Tiêu đề tiếng Việt, pinyin tiêu đề, cách dùng và lưu ý ngữ pháp được bổ sung.
- 40 câu điền từ với bốn đáp án được chọn riêng; 40 câu sắp xếp từ dùng ví dụ nguồn. Các chế độ từ vựng, nghe, dịch và luyện nói dùng đủ 40 mục từ.
- 4 câu trắc nghiệm ngữ pháp; 4 câu sắp xếp và 4 câu viết ngữ pháp dùng bốn ví dụ nguồn, không quảng cáo thành một ngân hàng câu hỏi độc lập lớn hơn thực tế.
- 5 bài đọc bổ sung dài lần lượt 184, 185, 175, 202, 200 ký tự, gồm dấu câu; mỗi bài 5 câu hỏi, tổng 25 câu hỏi nội dung, ý chính, suy luận. Câu hỏi/đáp án bằng tiếng Trung, có pinyin đoạn đọc, bản dịch và giải thích Việt.
- Một đề viết đoạn văn và đoạn mẫu có pinyin, bản dịch; tự lưu nháp khi gõ và khôi phục khi tải lại trang.
- Bài tập/bài đọc/lưu ý bổ sung được ghi rõ, không trình bày như trích nguyên văn giáo trình.
- Từ điển tra cứu kế thừa 2.505 mục từ của HSK 3, bổ sung cách đọc theo ngữ cảnh cho 还, 只, 得 và các mục tra cứu phục vụ đáp án tiếng Trung trong file riêng. Không đưa các mục tra cứu này vào danh sách 40 từ mới.
- Bấm từ trong bài đọc để mở nghĩa và pinyin gần vị trí bấm; hỗ trợ bàn phím và đóng bằng Escape.

Pinyin và các khoảng trắng trong ví dụ nguồn được giữ nguyên, bao gồm các chỗ nguồn viết dính âm tiết và dùng ký tự `ɡ`. Không tự sửa nguồn âm thầm. Đây là bản triển khai theo tài liệu cung cấp, chưa phải bản hiệu đính độc lập toàn bộ pinyin của giáo trình.

## Chế độ học

Hán tự → nghĩa; nghĩa → Hán tự; chọn pinyin; nghe chọn chữ; nghe câu chọn câu tiếng Trung tương ứng; gõ Hán tự; nghe chép chính tả; điền từ; sắp xếp từ; dịch câu; đọc hiểu câu; luyện nói; trắc nghiệm ngữ pháp; sắp xếp câu ngữ pháp; viết câu ngữ pháp; đọc hiểu theo đoạn; viết đoạn văn; ôn tập tổng hợp.

Câu hỏi có đáp án cố định được chấm theo đáp án, bỏ khác biệt dấu câu và khoảng trắng. Dịch câu, đọc hiểu câu tự viết, luyện nói, viết câu ngữ pháp và viết đoạn dùng tự đối chiếu; không chấm đúng theo từ khóa hoặc tuyên bố có AI chấm ngữ nghĩa. Kết quả tự đối chiếu tách khỏi điểm câu chấm tự động.

## Điều chỉnh bài tập theo phản hồi

- Nghe hiểu câu: nghe câu ví dụ và chọn câu tiếng Trung tương ứng, thay cho chọn bản dịch tiếng Việt.
- Đọc hiểu đoạn: cả bốn phương án của mỗi câu hỏi đều bằng tiếng Trung; toàn bộ câu hỏi cũng bằng tiếng Trung, còn giải thích giữ tiếng Việt. Bản dịch phương án cũ được giữ trong dữ liệu để đối chiếu.
- Bấm trực tiếp vào chữ hoặc toàn bộ thẻ để chọn đáp án; bỏ nút “Chọn đáp án” phụ. Tra từ trong đoạn văn/câu hỏi vẫn hoạt động; các phương án tiếng Trung có thể tra từ sau khi chấm, tránh nhầm thao tác chọn và tra. Hỗ trợ Enter bằng nút HTML nguyên bản, không lồng nút.
- Đồng bộ toàn bộ 18 chế độ Bài 1 theo cỡ chữ thực tế của Trắc nghiệm ngữ pháp: đề 32px và đáp án 23px (cùng line-height 1.45), nét thường 400; áp dụng cả ô nhập, từ sắp xếp, đáp án câu nghe/đọc, đáp án phản hồi và các câu ôn tổng hợp. Pinyin, chú thích, nút điều khiển giữ cỡ chữ riêng. Riêng đoạn đọc theo mẫu HSK 1 dùng 27px, giãn dòng 1.65; đoạn mẫu luyện viết vẫn dùng 23px.
- Luyện nói: kết quả nhận diện được điền vào ô trả lời, có thể sửa trước khi tự đối chiếu. Không tự nộp; bỏ qua kết quả đến muộn khi đổi câu, đổi màn hình, đã nộp hoặc đã bật lượt micro mới.

Kiểm thử `tests/hsk4-exercise-updates.cjs` đạt 116 kiểm tra tại 1440px/390px, gồm trọn bộ 40 câu nghe và bài đọc đầu tiên với 5 câu hỏi, dữ liệu tra từ, cỡ chữ, sửa kết quả micro và các tình huống kết quả đến muộn. Micro trong bộ kiểm thử được giả lập; nhận diện âm thanh thực tế vẫn phụ thuộc thiết bị và dịch vụ trình duyệt.

Kiểm thử `tests/hsk4-game-typography.cjs` đạt 171 kiểm tra, đối chiếu trực tiếp mọi chế độ và từng câu của lượt ôn tổng hợp với cỡ chữ được trình duyệt tính cho Trắc nghiệm ngữ pháp tại 1440px, 390px và 360px. Hai biến CSS `--hsk4-game-prompt-size` / `--hsk4-game-answer-size` là cấu hình chung, chỉ nằm trong giao diện HSK 4.

## Giao diện đọc hiểu theo HSK 1

- `reading-hsk1.css` lấy nguyên khối CSS `hsk1-reading-picker-style` từ `HSK1/index.html`; chỉ nạp trên HSK 4, không sửa HSK 1.
- Danh sách có 3 cột trên máy tính lớn, 2 cột trên màn hình vừa và 1 cột trên điện thoại. Mỗi thẻ hiển thị tên, 5 câu hỏi, trạng thái và kết quả đã lưu, cùng nút bắt đầu/luyện lại.
- Đoạn văn, tiêu đề, điều khiển và câu hỏi nằm trong một khung rộng như HSK 1. Các lựa chọn đặt thành lưới ở bên dưới, không còn bố cục bài đọc trái/câu hỏi phải. Câu hỏi và đáp án vẫn bằng tiếng Trung.
- “Hiện Pinyin” mở khung nền xám có Hán tự và pinyin đặt trên từng từ/cụm từ bằng ruby. Pinyin lấy từ các mục tra cứu đã có, không phải một đoạn phiên âm rời. Pinyin toàn đoạn trong dữ liệu không bị thay đổi.
- Trạng thái hiện pinyin được giữ khi sang câu hỏi khác trong cùng bài; chuyển sang bài đọc khác bắt đầu với pinyin ẩn.
- Tra từ hoạt động trong đoạn văn và câu hỏi; đáp án có tra từ sau khi chấm. Trước khi chấm, nhấn chữ, vùng thẻ hoặc Enter để chọn trực tiếp.

`tests/hsk4-hsk1-reading-ui.cjs` đạt 184 kiểm tra trên 1440/900/390/360px: đối chiếu CSS thẻ và khung ruby với HSK 1 thật, kiểm tra toàn bộ 5 bài đọc, pinyin đúng từng từ và toàn văn, bật/ẩn/giữ trạng thái, tra từ, chấm bài và không tràn ngang.

`tests/hsk4-reading-layout.cjs` đạt 100 kiểm tra cho 25 câu ở 1440×900, 1280×800, 390×844 và 360×640; kiểm tra khung đọc rộng, cỡ chữ, tra từ và hoàn thành 5/5 từng bài. Giao diện HSK 1 mới ưu tiên theo dõi đoạn văn/pinyin, nên trang có thể cuộn dọc với đoạn văn dài.

## Bài đọc độc lập theo unit

Unit 1 có 5 bài đọc, mỗi bài 5 câu hỏi. Màn hình “Chọn bài đọc” hiển thị từng bài riêng, cho phép chọn bài 5 trước mà không cần làm bài 1–4. Mỗi lượt chỉ có câu hỏi của một bài; hoàn thành hiển thị kết quả của bài đó, có nút làm lại và trở về danh sách, không tự chuyển bài tiếp theo.

Các bài đọc có trường `lesson`, được lọc theo unit; hiện chỉ Unit 1 được mở. ID bài đọc nằm trong URL nên tải lại trang hoặc mở trực tiếp vẫn vào đúng bài đã chọn (bắt đầu lại từ câu 1). Kết quả lưu kèm `readingId`, hiển thị riêng trên từng thẻ bài đọc. Lịch sử cũ được giữ nguyên; những lượt đọc tổng hợp cũ không bị gán nhầm vào một bài riêng.

`tests/hsk4-independent-readings.cjs` đạt 106 kiểm tra, gồm chọn tự do, số câu đúng từng bài, hoàn thành/dừng đúng bài, làm lại, tải lại, URL trực tiếp, lưu kết quả riêng và không bắt buộc làm tuần tự. Các đoạn đọc/bài tập là nội dung bổ sung, không thay đổi 40 từ mới hay 4 cấu trúc nguồn của Unit 1.

## Tiến độ và điều hướng

Khóa riêng: `hsk4-quest-v1`, `hsk4-guided-v1-L01`, `hsk4-voice`. Lưu từ đã/chưa thuộc, từ từng sai, lượt luyện tập hoàn thành, tab đã mở, bài đã mở học và bản nháp. Thống kê Thượng/Hạ/tổng chỉ tính nội dung đã mở; không ghi tỷ lệ Bài 1 là tỷ lệ hoàn thành 20 bài. Mở trang bài học không đồng nghĩa đã nắm vững bài.

Ôn tập theo toàn bộ từ, từ chưa thuộc, từ từng trả lời sai. Xuất/nhập bản sao lưu HSK 4 có kiểm tra cấu trúc; yêu cầu xác nhận trước khi thay thế dữ liệu hiện có. Đặt lại HSK 4 không xóa tiến độ cấp khác. Lịch sử giữ tối đa 500 lượt; màn hình hiển thị 50 lượt mới nhất. Dữ liệu vẫn nằm trên trình duyệt, không có đồng bộ tài khoản.

Điều hướng dùng hash, có nút quay về bài học/ôn tập, hỗ trợ nút Back của trình duyệt. Tải lại trang viết giữ đúng màn hình và nháp; tải lại lượt chơi đang làm trở về danh sách chế độ, không khôi phục lượt chơi dở.

## File và triển khai

- `index.html`: khung trang; `hsk3-theme.css`: CSS dẫn xuất nguyên bản từ HSK 3; `reading-hsk1.css`: CSS thẻ bài đọc theo HSK 1; `styles.css`: phần bổ sung riêng HSK 4; `assets/`: ba minh họa SVG kế thừa từ giao diện HSK 3; `app.js`: điều hướng, học, trò chơi, tiến độ; `speech.js`: phát âm.
- `data/lesson-01.json`: nội dung nguồn Bài 1.
- `data/practice-01.json`: ngân hàng luyện tập và bài đọc bổ sung.
- `data/dictionary.json`, `data/dictionary-overrides.json`: tra cứu bổ trợ.
- `data/source-manifest.json`: SHA-256 tài liệu gốc và nội dung từ vựng, bản đối chiếu ngữ pháp.
- `../tests/hsk4-content.cjs`, `../tests/hsk4-smoke.cjs`, `../tests/hsk4-ui-parity.cjs`: kiểm tra dữ liệu, chức năng và đối chiếu giao diện thực tế với HSK 3.
- `../scripts/sync-hsk3-theme.py`: đồng bộ CSS dẫn xuất từ HSK 3.
- `../index.html`: chỉ thay thẻ HSK 4 thành liên kết vào khóa học, ghi đúng 1 bài đã mở / 40 từ / 4 cấu trúc.

Có thể chạy bằng bất kỳ máy chủ file tĩnh nào, ví dụ `python -m http.server 8000` ở gốc repository, rồi mở `/HSK4/index.html`. Hoạt động trên GitHub Pages với đường dẫn `/HSK-version-3.0/HSK4/index.html`; không cần backend/build. Mở trực tiếp bằng `file://` không hỗ trợ tải JSON qua fetch.

## Kiểm tra

```sh
node --check HSK4/app.js
node --check HSK4/speech.js
node tests/hsk4-content.cjs
node tests/hsk4-smoke.cjs
node tests/hsk4-ui-parity.cjs
node tests/hsk4-exercise-updates.cjs
node tests/hsk4-game-typography.cjs
node tests/hsk4-compact-choices.cjs
node tests/hsk4-reading-answer-grid.cjs
node tests/hsk4-reading-layout.cjs
node tests/hsk4-independent-readings.cjs
node tests/hsk4-hsk1-reading-ui.cjs
node tests/hsk3-smoke.cjs
```

Cần Playwright và Chromium; có thể đặt `CHROMIUM_PATH`. Đặt `HSK4_SCREENSHOTS` thành một thư mục đã có để lưu ảnh máy tính/điện thoại.

Kiểm tra nội dung đối chiếu hash toàn bộ bảy trường nguồn và đầy đủ ngữ pháp, cấu trúc đáp án, sắp xếp câu, câu điền từ và khả năng tra mọi từ trong bài đọc. Kiểm thử trình duyệt dùng máy chủ tĩnh có tiền tố repository giống GitHub Pages, màn hình 1440px/390px, các chế độ, hoàn thành bài đọc, phản hồi đúng/sai, bộ lọc, flashcard, bản nháp, sao lưu, từ sai, khóa lưu trữ tách biệt và điều hướng.

Các thành phần giao diện chung đạt 134 kiểm tra đối chiếu thực tế với HSK 3 và tương tác trên 1440px/390px; thẻ lựa chọn tiếng Trung được kiểm tra riêng theo yêu cầu mới.

Kết quả Bài 1: kiểm tra nội dung và hash đạt; bộ trình duyệt đạt 270 kiểm tra trên 1440px/390px, không có lỗi JavaScript, không tràn ngang trong các chế độ, đủ dữ liệu tra cứu cho năm bài đọc. Kiểm thử hồi quy HSK 3 đạt 1.190 kiểm tra trên 1440px/390px, bao gồm mở HSK 1/2, không có lỗi JavaScript chưa xử lý.

Phát âm thực tế cần giọng tiếng Trung trên thiết bị; nhận diện cần trình duyệt hỗ trợ, kết nối dịch vụ và quyền micro. Kiểm thử tự động xác minh lời gọi phát âm, không xác nhận âm thanh nghe thực tế hay chất lượng nhận diện. Việc xuất bản GitHub Pages phụ thuộc nhánh được cấu hình trong repository; bản sửa được gửi qua PR để duyệt trước khi merge.

## Làm mới tài nguyên khi phát hành

Trang HSK 4 gắn tham số phiên bản cho `app.js` và `styles.css`; JSON dùng cùng phiên bản của script và `cache: no-cache` để trình duyệt kiểm tra lại dữ liệu, tránh tiếp tục hiển thị câu hỏi cũ sau khi triển khai. Khi phát hành thay đổi giao diện/logic, cập nhật phiên bản trong `HSK4/index.html`. Không xóa hoặc thay đổi khóa tiến độ localStorage.

## Lưới đáp án đọc hiểu linh hoạt

Lưới tự chọn 4, 2 hoặc 1 đáp án mỗi hàng theo phương án dài nhất và chiều rộng thực tế của khung. Đo chữ theo đúng font đang hiển thị: nhóm ngắn khoảng tối đa 8 chữ Hán dùng 4 cột, nhóm vừa khoảng tối đa 16 chữ dùng 2 cột, dài hơn dùng 1 cột; nếu khung không đủ chỗ thì tự giảm 4 → 2 → 1. Tính cả đệm/viền và giữ chiều rộng thẻ tối thiểu; không dùng bố cục 3 cột, không cắt nội dung hoặc thu nhỏ chữ.

Lưới được tính lại khi đổi câu, thay kích thước màn hình và khi font tải xong. Việc này chỉ cập nhật cột CSS, không khởi tạo lại câu hỏi, không thay trạng thái pinyin hay điểm số.

`node tests/hsk4-reading-answer-grid.cjs` đạt 101 kiểm tra: toàn bộ 25 câu ở 1440/900/390/360px; kiểm tra cụ thể đáp án ngắn 4 cột, ví dụ nhập học 2 cột, đáp án dài 1 cột, không tràn/cắt chữ, cỡ chữ 23px, tra từ, chấm điểm và giữ trạng thái khi thu/phóng cửa sổ.

## Khoảng cách gọn và chọn trực tiếp

Thu hẹp khoảng đệm khung bài tập còn 20px trên máy tính / 16px trên điện thoại, khoảng cách đáp án 10px, bỏ margin dư của từng thẻ. Thu hẹp các khung bài học, bảng từ vựng, ngữ pháp và danh sách bài đọc; giữ nguyên cỡ chữ và giãn ruby để pinyin không chồng chữ. Chỉ áp dụng trong HSK 4.

`tests/hsk4-compact-choices.cjs` kiểm tra chọn trực tiếp trên chữ/thẻ, bàn phím, tra từ sau chấm, không chấm lặp, khoảng cách và không tràn ngang trên 1440/390/360px.
