# HSK 3 content and validation

`hsk3.html` copies the existing HSK 2 standalone HTML/CSS/JavaScript design and practice engines. `hsk1.html` and `hsk2.html` are unchanged. The HSK 3 card on `index.html` opens the new course; the course header returns to the site homepage.

## Supplied learning data

- **HSK 3 từ vựng và ngữ pháp theo bài học.docx:** 18 lessons, 483 vocabulary occurrences, 63 grammar points and 126 grammar examples.
- **HSK 3 - 36 chủ đề từ vựng.docx:** 36 topics, 960 vocabulary occurrences, 946 distinct headwords.
- Every vocabulary entry retains its original Hanzi, pinyin, Vietnamese meaning, Chinese example, example pinyin and Vietnamese translation. The sequence and duplicate entries are retained, including 乐队 and 范围.
- Lesson titles and grammar explanations/formulas/tips/notes/examples come from the supplied lesson document. Vietnamese lesson-title subtitles were added for navigation.
- The documents are the source of the vocabulary lists. Their own attribution and editorial caveats apply; the course does not claim independent certification against an official New HSK syllabus. Source pinyin and meanings are transcribed as supplied, including any source inconsistencies; no silent corrections have been made.
- `hsk3-source-manifest.json` records the document SHA-256 hashes and one hash per ordered vocabulary group. Hashes cover all six original vocabulary fields and allow the automated check to detect omissions or altered text.

## Supplementary practice

- 126 grammar exercises use the 126 supplied grammar examples, with a word or structure blanked and three distractors added. Sentence ordering and writing reuse these same examples. Counts reflect available source examples, rather than advertising a fictional 30-question bank per lesson.
- 90 short reading passages (five per lesson) and 360 comprehension questions were newly authored for HSK 3. They include pinyin and Vietnamese translations. They are supplementary learning material, not official exam passages or quotations from the documents. The passages use vocabulary from the HSK 1–3 headwords bundled in this repository; `hsk3-reading-vocabulary-audit.json` records the segmentation and source levels. Grammatical combinations can consist of multiple learned headwords.
- Reading lengths are shorter than the HSK 2 reading bank. The same reading interface, dictionary lookup, audio controls, answer feedback and results are retained; question counts use the actual bank size.
- The bundled lookup dictionary retains earlier-level dictionary entries to support reading and uses supplied HSK 3 entries for HSK 3 headwords. It does not add those earlier-level entries to the HSK 3 vocabulary lists.
- Open writing and speaking retain self-comparison. Browser speech synthesis and speech recognition depend on the visitor's device, available Chinese voices, browser support and microphone permission. There is no automatic semantic or pronunciation scoring.

## Progress isolation

HSK 3 uses `hsk3-quest-v1`, `hsk3-topics-v2`, `hsk3-guided-v2-*`, `hsk3-writing-draft` and `hsk3-voice`. It does not read or overwrite HSK 1/2 progress or shared draft/voice keys. Lesson/topic flashcards and practice history retain the familiar separate progress models from HSK 2. Data remains local to the browser and can be exported/imported from the statistics screen.

## Checks

Run `node tests/hsk3-smoke.cjs` with Playwright and Chromium installed. Set `CHROMIUM_PATH` for a different Chromium executable; set `HSK3_SCREENSHOTS` to an existing output directory to save desktop/mobile screenshots.

The reading-specific check `node tests/hsk3-readings.cjs` verifies all 90 passages and 360 answers, five passages per lesson, dictionary coverage, source-vocabulary segmentation and the complete 20-question flow per lesson at desktop/mobile sizes.

The general check covers all 18 lessons, all 36 topics, all source vocabulary hashes, the four lesson tabs, every vocabulary/sentence game mode, all three grammar modes, reading completion, flashcard flipping, persistent learned-word state, writing drafts, review selection, statistics, back navigation, speech invocation and HSK 1/2 progress isolation at 1440px and 390px widths. It also opens the original HSK 1 and HSK 2 pages and fails on uncaught browser errors. Actual audible output and real microphone recognition require a supported user device and are not asserted by the headless checks.
