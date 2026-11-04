# Từ điển bổ sung cho đọc hiểu HSK 1

`reading-dictionary.js` cung cấp 18 mục đã đối chiếu: 17 mục bổ sung và chuẩn hóa cách viết pinyin của tên 小明. Mỗi mục lưu nguồn trong trường `source`; nghĩa tiếng Việt được biên soạn theo ngữ cảnh, không sao chép toàn bộ định nghĩa nguồn.

- [Hán Điển](https://zdic.net/hans/担心): đối chiếu pinyin và nghĩa cơ bản của chữ/từ, gồm 担心, 号码, 看书, 门, 首, 位, 难, 城市 và các chữ trong tên.
- [有意思 — Hán Điển](https://zdic.net/hans/有意思): dùng nghĩa “thú vị” và âm nhẹ `si` trong ngữ cảnh hiện tại.
- [Từ điển Bộ Giáo dục — 買東西](https://dict.revised.moe.edu.tw/dictView.jsp?ID=28004&la=0&powerMode=0): đối chiếu nghĩa mua đồ; giữ `dōngxi` với âm nhẹ `xi` theo cách đọc phổ thông đang dùng trong khóa.
- [Quy tắc chính tả pinyin GB/T 16159-2012](https://pinyin.info/rules/GBT16159-2012.html): tên người, họ và danh xưng; [cách dùng họ + danh xưng](https://elon.io/grammar/chinese-mandarin/nouns/titles).

Tên được giải thích như tên riêng: 李文 là Lý Văn, 王老师 là thầy/cô Vương; không dịch tên thành nghĩa rời của từng chữ. 丽 đọc `lì` trong 小丽; 王 đọc `Wáng` khi là họ; 难 đọc `nán` trong 很难写; 首 và 位 được giải thích là lượng từ đúng với câu ví dụ.

Phần hiện pinyin trước đây chỉ lấy từ vựng đến Unit đang học. Nay phần này dùng chung toàn bộ `hskLookupDictionary()` với phần bấm tra từ, gồm các mục bổ sung. Không thêm từ vào danh sách từ vựng cần học, không thay đổi nội dung, đáp án hoặc tiến độ.

Kiểm tra bằng `node tests/hsk1-reading-dictionary.cjs`: 75 bài đọc, 450 câu hỏi và các đáp án, 338 câu ví dụ; không còn chữ Hán chưa có dữ liệu tra từ trong phạm vi đã kiểm tra. Kiểm tra ruby không để sót chữ không chú âm, hộp tra tên, nghĩa Việt và phát âm ở 1440/390px. Tất cả dữ liệu được đóng gói trong website; bấm tra từ không gọi dịch vụ bên ngoài.
