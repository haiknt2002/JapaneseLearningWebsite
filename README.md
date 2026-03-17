# JapaneseLearningWebsite

A lightweight Japanese learning website built with HTML, CSS, and JavaScript.

Trang web học tiếng Nhật nhẹ, dùng HTML, CSS và JavaScript.

## Tiếng Việt

### Tính năng

- Học bảng Hiragana có tìm kiếm và bộ lọc theo hàng.
- Flashcard luyện nhanh ngẫu nhiên.
- Giao diện 2 ngôn ngữ: Tiếng Việt và Tiếng Nhật.
- Dữ liệu được tải từ file JSON trong thư mục Data.

### Cấu trúc dữ liệu

- File hiện tại: Data/hiragana.json
- Định dạng mỗi ký tự:
	- id
	- kana
	- romaji
	- row
	- column

Bạn có thể thêm bộ chữ mới (Katakana, từ vựng...) bằng cách tạo file JSON mới trong thư mục Data và cập nhật script.js để tải file đó.

## English

### Features

- Study Hiragana with search and row-based filtering.
- Random quick-practice flashcards.
- Bilingual interface: Vietnamese and Japanese.
- Data is loaded from JSON files inside the Data folder.

### Data structure

- Current file: Data/hiragana.json
- Character object fields:
	- id
	- kana
	- romaji
	- row
	- column

You can add new datasets (Katakana, vocabulary, etc.) by creating new JSON files in the Data folder and updating script.js to fetch those files.
