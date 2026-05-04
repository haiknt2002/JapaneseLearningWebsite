const state = {
	allKana: [],
	filteredKana: [],
	currentFlashcard: null,
	showFlashAnswer: false,
	language: "vi",
};

const elements = {
	langViBtn: document.getElementById("langViBtn"),
	langJaBtn: document.getElementById("langJaBtn"),
	controlsPanel: document.getElementById("controlsPanel"),
	tablePanel: document.getElementById("tablePanel"),
	practicePanel: document.getElementById("practicePanel"),
	rowFilter: document.getElementById("rowFilter"),
	searchInput: document.getElementById("searchInput"),
	resetBtn: document.getElementById("resetBtn"),
	kanaGrid: document.getElementById("kanaGrid"),
	emptyState: document.getElementById("emptyState"),
	totalCount: document.getElementById("totalCount"),
	visibleCount: document.getElementById("visibleCount"),
	nextCardBtn: document.getElementById("nextCardBtn"),
	flashcard: document.getElementById("flashcard"),
	flashKana: document.getElementById("flashKana"),
	flashRomaji: document.getElementById("flashRomaji"),
	kanaModal: document.getElementById("kanaModal"),
	closeModalBtn: document.getElementById("closeModalBtn"),
	modalKakiJun: document.getElementById("modalKakiJun"),
	modalKana: document.getElementById("modalKana"),
	modalRomaji: document.getElementById("modalRomaji"),
	flashStrokeBtn: document.getElementById("flashStrokeBtn"),
};

const rowOrder = ["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa", "n"];
const rowSimpleLabels = {
	a: "A",
	ka: "KA",
	sa: "SA",
	ta: "TA",
	na: "NA",
	ha: "HA",
	ma: "MA",
	ya: "YA",
	ra: "RA",
	wa: "WA",
	n: "N",
};
const i18n = {
	vi: {
		pageTitle: "Hiragana Study Hub",
		kicker: "Website học tiếng Nhật",
		heroTitle: "Học Hiragana dễ nhìn và dễ nhớ hơn",
		heroSubtitle: "Dữ liệu được đọc trực tiếp từ thư mục Data, không cần database. Lọc theo hàng, tìm theo romaji và luyện nhanh mỗi ngày.",
		totalChars: "Tổng ký tự",
		showingChars: "Đang hiển thị",
		searchLabel: "Tìm kana hoặc romaji",
		searchPlaceholder: "Ví dụ: ka, shi, し...",
		rowFilterLabel: "Lọc theo hàng",
		rowAll: "Tất cả",
		resetBtn: "Xóa bộ lọc",
		emptyState: "Không tìm thấy ký tự phù hợp.",
		practiceTitle: "Luyện nhanh",
		nextCardBtn: "Ký tự khác",
		practiceTip: "Mẹo: Thử đọc to ký tự trước khi bấm vào thẻ để kiểm tra.",
		flashPrompt: "Bấm để hiện romaji",
		flashNoData: "Không có dữ liệu",
		flashError: "Không thể khởi tạo",
		loadError: "Lỗi tải dữ liệu. Kiểm tra file Data/hiragana.json.",
		controlsAria: "Bộ lọc và tìm kiếm",
		tableAria: "Bảng hiragana",
		practiceAria: "Luyện tập flashcard",
		flashAria: "Flashcard hiragana",
		strokeOrderTitle: "Cách viết",
		strokeOrderBtn: "Xem cách viết",
	},
	ja: {
		pageTitle: "ひらがな学習ハブ",
		kicker: "日本語学習サイト",
		heroTitle: "見やすく学べるひらがなトレーニング",
		heroSubtitle: "データはDataフォルダのJSONから直接読み込みます。データベース不要で、行フィルタと検索、フラッシュカード練習ができます。",
		totalChars: "総文字数",
		showingChars: "表示中",
		searchLabel: "かな / ローマ字で検索",
		searchPlaceholder: "例: ka, shi, し...",
		rowFilterLabel: "行で絞り込み",
		rowAll: "すべて",
		resetBtn: "フィルタ解除",
		emptyState: "一致する文字が見つかりません。",
		practiceTitle: "クイック練習",
		nextCardBtn: "別の文字",
		practiceTip: "ヒント: 先に声に出して読んでからカードをタップして確認しましょう。",
		flashPrompt: "タップしてローマ字を表示",
		flashNoData: "データがありません",
		flashError: "初期化できません",
		loadError: "データ読み込みエラー。Data/hiragana.json を確認してください。",
		controlsAria: "検索とフィルタ",
		tableAria: "ひらがな一覧",
		practiceAria: "フラッシュカード練習",
		flashAria: "ひらがなフラッシュカード",
		strokeOrderTitle: "書き方",
		strokeOrderBtn: "書き方を見る",
	},
};

function t(key) {
	return i18n[state.language][key];
}

function toLabelRow(row) {
	return rowSimpleLabels[row] || row.toUpperCase();
}

function sanitize(value) {
	return (value || "").trim().toLowerCase();
}

function renderRowOptions() {
	const selectedValue = elements.rowFilter.value;
	elements.rowFilter.innerHTML = "";

	const allOption = document.createElement("option");
	allOption.value = "all";
	allOption.textContent = t("rowAll");
	elements.rowFilter.append(allOption);

	rowOrder.forEach((row) => {
		const option = document.createElement("option");
		option.value = row;
		option.textContent = toLabelRow(row);
		elements.rowFilter.append(option);
	});

	elements.rowFilter.value = selectedValue || "all";
}

function renderKanaGrid(list) {
	elements.kanaGrid.innerHTML = "";
	elements.visibleCount.textContent = String(list.length);

	if (list.length === 0) {
		elements.emptyState.hidden = false;
		return;
	}

	elements.emptyState.hidden = true;

	list.forEach((item) => {
		const card = document.createElement("article");
		card.className = "kana-card";

		const kanaSpan = document.createElement("span");
		kanaSpan.className = "kana";
		kanaSpan.textContent = item.kana;

		const romajiSpan = document.createElement("span");
		romajiSpan.className = "romaji";
		romajiSpan.textContent = item.romaji;

		card.append(kanaSpan, romajiSpan);
		card.addEventListener("click", () => openStrokeModal(item));
		elements.kanaGrid.append(card);
	});
}

function updateStaticTexts() {
	document.title = t("pageTitle");
	document.documentElement.lang = state.language;

	document.querySelectorAll("[data-i18n]").forEach((node) => {
		const key = node.dataset.i18n;
		if (t(key)) {
			node.textContent = t(key);
		}
	});

	elements.searchInput.placeholder = t("searchPlaceholder");
	elements.controlsPanel.setAttribute("aria-label", t("controlsAria"));
	elements.tablePanel.setAttribute("aria-label", t("tableAria"));
	elements.practicePanel.setAttribute("aria-label", t("practiceAria"));
	elements.flashcard.setAttribute("aria-label", t("flashAria"));

	if (state.currentFlashcard) {
		elements.flashRomaji.textContent = state.showFlashAnswer
			? state.currentFlashcard.romaji
			: t("flashPrompt");
	} else {
		elements.flashRomaji.textContent = t("flashNoData");
	}

	updateLanguageButtons();
	if (!elements.emptyState.hidden) {
		elements.emptyState.textContent = t("emptyState");
	}
}

function updateLanguageButtons() {
	const isVi = state.language === "vi";
	elements.langViBtn.classList.toggle("is-active", isVi);
	elements.langJaBtn.classList.toggle("is-active", !isVi);
	elements.langViBtn.setAttribute("aria-pressed", String(isVi));
	elements.langJaBtn.setAttribute("aria-pressed", String(!isVi));
}

function setLanguage(lang) {
	if (!i18n[lang] || state.language === lang) {
		return;
	}

	state.language = lang;
	renderRowOptions();
	updateStaticTexts();
	renderKanaGrid(state.filteredKana);
}

function applyFilters() {
	const selectedRow = elements.rowFilter.value;
	const keyword = sanitize(elements.searchInput.value);

	state.filteredKana = state.allKana.filter((item) => {
		const byRow = selectedRow === "all" || item.row === selectedRow;
		const byKeyword =
			keyword.length === 0 ||
			item.romaji.includes(keyword) ||
			item.kana.includes(keyword);
		return byRow && byKeyword;
	});

	renderKanaGrid(state.filteredKana);
	if (!state.filteredKana.some((i) => state.currentFlashcard && i.id === state.currentFlashcard.id)) {
		drawRandomFlashcard();
	}
}

function drawRandomFlashcard() {
	const source = state.filteredKana;
	if (!source || source.length === 0) {
		state.currentFlashcard = null;
		elements.flashKana.textContent = "...";
		elements.flashRomaji.textContent = t("flashNoData");
		return;
	}

	const randomIndex = Math.floor(Math.random() * source.length);
	state.currentFlashcard = source[randomIndex];
	state.showFlashAnswer = false;
	elements.flashKana.textContent = state.currentFlashcard.kana;
	elements.flashRomaji.textContent = t("flashPrompt");
}

function toggleFlashcardAnswer() {
	if (!state.currentFlashcard) {
		return;
	}

	state.showFlashAnswer = !state.showFlashAnswer;
	elements.flashRomaji.textContent = state.showFlashAnswer
		? state.currentFlashcard.romaji
		: t("flashPrompt");
}

async function openStrokeModal(item) {
	if (!item) return;
	elements.modalKana.textContent = item.kana;
	elements.modalRomaji.textContent = item.romaji;
	
	elements.modalKakiJun.innerHTML = "<span class='meta'>Đang tải...</span>";
	elements.kanaModal.showModal();

	try {
		const hex = item.kana.charCodeAt(0).toString(16).padStart(5, '0');
		const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;
		const res = await fetch(url);
		if (!res.ok) throw new Error("SVG not found");
		
		const svgText = await res.text();
		elements.modalKakiJun.innerHTML = svgText;
		
		const svg = elements.modalKakiJun.querySelector('svg');
		if (svg) {
			svg.setAttribute('width', '100%');
			svg.setAttribute('height', '100%');
			
			// Làm nổi bật các con số thứ tự nét
			const numbersGroup = svg.querySelector('g[id^="kvg:StrokeNumbers"]');
			if (numbersGroup) {
				numbersGroup.style.fill = '#1f2937';
				numbersGroup.style.fontSize = '12px';
				numbersGroup.style.fontWeight = 'bold';
			}

			// Đổi màu nền xám mờ cho chữ cái
			const pathsGroup = svg.querySelector('g[id^="kvg:StrokePaths"]');
			if (pathsGroup) {
				pathsGroup.style.stroke = '#e5e7eb';

				// Clone nét để chạy animation đè lên nét mờ
				const animatedGroup = pathsGroup.cloneNode(true);
				animatedGroup.style.stroke = 'var(--accent-strong)';
				svg.appendChild(animatedGroup);

				const paths = animatedGroup.querySelectorAll('path');
				paths.forEach((path, i) => {
					const length = path.getTotalLength() || 200;
					path.style.strokeDasharray = length;
					path.style.strokeDashoffset = length;
					path.style.animation = `drawStroke 0.6s ease-out forwards ${i * 0.8 + 0.2}s`;
				});

				// Đưa các con số lên lớp trên cùng để không bị nét che khuất
				if (numbersGroup) {
					svg.appendChild(numbersGroup);
				}
			}
		}
	} catch (e) {
		elements.modalKakiJun.innerHTML = `<span class='meta'>Lỗi tải ảnh</span>`;
		console.error("Lỗi tải nét viết: ", e);
	}
}

function bindEvents() {
	elements.langViBtn.addEventListener("click", () => setLanguage("vi"));
	elements.langJaBtn.addEventListener("click", () => setLanguage("ja"));

	elements.rowFilter.addEventListener("change", applyFilters);
	elements.searchInput.addEventListener("input", applyFilters);

	elements.resetBtn.addEventListener("click", () => {
		elements.rowFilter.value = "all";
		elements.searchInput.value = "";
		applyFilters();
	});

	elements.nextCardBtn.addEventListener("click", drawRandomFlashcard);
	elements.flashcard.addEventListener("click", toggleFlashcardAnswer);

	elements.closeModalBtn.addEventListener("click", () => elements.kanaModal.close());
	elements.kanaModal.addEventListener("click", (e) => {
		if (e.target === elements.kanaModal) {
			elements.kanaModal.close();
		}
	});
	elements.flashStrokeBtn.addEventListener("click", () => openStrokeModal(state.currentFlashcard));
}

async function bootstrap() {
	try {
		const response = await fetch("Data/hiragana.json");
		if (!response.ok) {
			const statusInfo = [response.status, response.statusText].filter(Boolean).join(" ");
			const messageBase = t("loadError");
			const fullMessage = statusInfo ? `${messageBase} (${statusInfo})` : messageBase;
			throw new Error(fullMessage);
		}

		const data = await response.json();
		state.allKana = data.characters || [];
		state.filteredKana = [...state.allKana];

		elements.totalCount.textContent = String(state.allKana.length);
		renderRowOptions();
		renderKanaGrid(state.filteredKana);
		drawRandomFlashcard();
		updateStaticTexts();
		bindEvents();
	} catch (error) {
		elements.kanaGrid.innerHTML = "";
		elements.emptyState.hidden = false;
		elements.emptyState.textContent = t("loadError");
		elements.flashKana.textContent = "!";
		elements.flashRomaji.textContent = t("flashError");
		console.error(error);
	}
}

bootstrap();
