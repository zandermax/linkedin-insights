const CURRENCIES = ['$', '€'];

// Existing selectors, subject to change
const CURRENT_SELECTED_JOB = '.jobs-search-results-list__list-item--active';
const JOB_ENTRY_ELEMENT = 'main ul li';
const JOB_DETAIL_ELEMENT = `${JOB_ENTRY_ELEMENT} ul li`;

// Gets selector that selects child elements of a type, or the parent when that type is not present
const getChildOrParent = (baseSelector, withAndWithout) =>
	[
		`${baseSelector} ${withAndWithout}`,
		`${baseSelector}:not(:has(${withAndWithout}))`,
	].join(',');

const pageTypes = {
	recommended: 'RECOMMENDED',
	saved: 'SAVED',
	search: 'SEARCH',
	topApplicant: 'TOP_APPLICANT',
};

const COUNTRY_ELEMENTS = {
	[pageTypes.recommended]: `${JOB_DETAIL_ELEMENT}`,
	[pageTypes.saved]: '.entity-result__secondary-subtitle',
	[pageTypes.search]: `${JOB_DETAIL_ELEMENT}`,
	[pageTypes.topApplicant]: `${JOB_DETAIL_ELEMENT}`,
};

const TIME_ELEMENTS = {
	// Not currently in the UI on this page
	[pageTypes.recommended]: null,
	[pageTypes.saved]: getChildOrParent(
		'main ul li.reusable-search__result-container .workflow-posted-jobs__jobs-insight',
		'.reusable-search-simple-insight--subsequent',
	),
	// Not currently in the UI on this page
	[pageTypes.search]: null,
	[pageTypes.topApplicant]: `${JOB_DETAIL_ELEMENT}`,
};

// Custom classes that this script adds
const SALARY_CLASS = 'z-salary';
const REMOTE_CLASS = 'z-remote';
const HYBRID_CLASS = 'z-hybrid';
const CONTRACT_CLASS = 'z-contract';

const timeToStyle = {
	minute: '#4CAF50',
	hour: '#4CAF50',
	day: '#0097A7',
	week: '#4527A0',
	month: '#B71C1C',
};

const abbreviatedTimeToStyle = {
	m: 'minute',
	h: 'hour',
	d: 'day',
	w: 'week',
	mo: 'month',
};

const countryToFlag = {
	Ireland: '🇮🇪',
	Germany: '🇩🇪',
	Spain: '🇪🇸',
};

const waitForElement = (query, callback, isConstant) => {
	const observer = new MutationObserver(function (mutations, me) {
		const element = document.querySelector(query);
		if (element) {
			if (!isConstant) {
				me.disconnect(); // stop observing
			}
			callback();
		}
	});
	observer.observe(document, {
		childList: true,
		subtree: true,
	});
};

const createStyleSheet = () => {
	const styleEl = document.createElement('style');
	document.head.appendChild(styleEl);

	const styleSheet = styleEl.sheet;

	styleSheet.insertRule(`${CURRENT_SELECTED_JOB} {
		border: 5px double black;
		border-radius: 5px;
	}`);

	styleSheet.insertRule(`.${SALARY_CLASS} {
		border: 2px solid var(--color-signal-neutral, lab(43.02 -3.59 -12.46));
		border-radius: 15px;
		padding: 3px;
		color: black;
		background-color: white;
		font-size: 1.25em;
	}`);

	styleSheet.insertRule(`.${REMOTE_CLASS} {
		background-color: #FBE9E7;
	}`);
	styleSheet.insertRule(`.${HYBRID_CLASS} {
		background-color: #E0F7FA;
	}`);
	styleSheet.insertRule(`.${CONTRACT_CLASS} {
		border: 2px dashed;
	}`);

	// Time styles
	Object.keys(timeToStyle).forEach((time) => {
		styleSheet.insertRule(`.z-${time} {
			padding: 0.25rem;
			color: white;
			background-color: ${timeToStyle[time]};
			border-radius: 4px;
		}`);
	});

	// Country flags
	Object.keys(countryToFlag).forEach((country) => {
		styleSheet.insertRule(`.z-${country}::before {
			content: '${countryToFlag[country]}';
			position: relative;
			left: -1ch;
			transform: scale(1.5);
			color: rgb(0, 0, 0);
		}`);
		styleSheet.insertRule(`.z-${country} {
			padding-inline-start: 1.5ch;
		}`);
	});
};

const timeStyling = (element) => {
	if (/\bago/.test(element.innerText)) {
		let stylingApplied = false;
		Object.keys(timeToStyle).forEach((time) => {
			if (!stylingApplied && element.innerText.includes(time)) {
				element.classList.add(`z-${time}`);
				stylingApplied = true;
			}
		});
		// There are 2 formats...
		if (!stylingApplied && /\d\w+/.test(element.innerText)) {
			// TODO handle "Easy Apply" in the same element text
			let text = element.innerText;
			text = text.substring('Posted '.length + 1, text.indexOf(' ago'));
			element.classList.add(`z-${abbreviatedTimeToStyle[text]}`);
		}
	}
};

const jobTypeStyling = (element) => {
	if (element.innerText.includes('(Hybrid)')) {
		element.classList.add(HYBRID_CLASS);
	} else if (element.innerText.includes('(Remote)')) {
		element.classList.add(REMOTE_CLASS);
	}
};

const countryStyling = (element) => {
	Object.keys(countryToFlag).forEach((country) => {
		if (
			!element.classList.contains(`z-${country}`) &&
			new RegExp(`\\b${country}`).test(element.innerText)
		) {
			element.classList.add(`z-${country}`);
		}
	});
};

const contractStyling = (element) => {
	if (element.innerText.includes('contract')) {
		element.classList.add(CONTRACT_CLASS);
	}
};

const currencyStyling = (element) => {
	CURRENCIES.forEach((currency) => {
		if (
			!element.classList.contains(SALARY_CLASS) &&
			element.innerText.includes(currency)
		)
			element.classList.add(SALARY_CLASS);
	});
};

// TODO current selected job highlighting
const applyStyling = () => {
	document.querySelectorAll(JOB_ENTRY_ELEMENT).forEach((jobData) => {
		// Location types
		jobTypeStyling(jobData);
		// Contract roles
		contractStyling(jobData);
	});

	let listType = '';
	if (
		/linkedin.com\/jobs\/collections\/recommended\//.test(window.location.href)
	) {
		listType = pageTypes.recommended;
	} else if (
		/linkedin.com\/my-items\/saved-jobs\//.test(window.location.href)
	) {
		listType = pageTypes.saved;
	} else if (/linkedin.com\/jobs\/search\//.test(window.location.href)) {
		listType = pageTypes.search;
	} else if (
		/linkedin.com\/jobs\/collections\/top-applicant\//.test(
			window.location.href,
		)
	) {
		listType = pageTypes.topApplicant;
	}

	if (listType) {
		// Country flags
		document
			.querySelectorAll(COUNTRY_ELEMENTS[listType])
			.forEach(countryStyling);
		// Time since posting
		document.querySelectorAll(TIME_ELEMENTS[listType]).forEach(timeStyling);
		// Salaries
	}
	document.querySelectorAll(JOB_DETAIL_ELEMENT).forEach(currencyStyling);
};

createStyleSheet();
waitForElement(JOB_ENTRY_ELEMENT, applyStyling, true);
