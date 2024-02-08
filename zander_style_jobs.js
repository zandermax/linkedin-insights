const CURRENCIES = ['$', '€'];

// Existing selectors, subject to change
const CURRENT_SELECTED_JOB = '.jobs-search-results-list__list-item--active';
const JOB_ENTRY_ELEMENT = {
	// Job search
	jobSearch: '.jobs-search-results-list li',
	// Job lists, such as "Top job picks for you"
	jobList: '.reusable-search__entity-result-list li',
	// Saved jobs
	savedJobs: '.reusable-search__result-container li',
};
const ALL_JOB_LISTS = Object.values(JOB_ENTRY_ELEMENT).join(',');

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
		Object.keys(timeToStyle).forEach((time) => {
			if (element.innerText.includes(time)) {
				element.classList.add(`z-${time}`);
			}
		});
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

// TODO current selected job highlighting
const applyStyling = () => {
	document.querySelectorAll(ALL_JOB_LISTS).forEach((jobData) => {
		// Location types
		if (jobData.innerText.includes('(Hybrid)')) {
			jobData.classList.add(HYBRID_CLASS);
		} else if (jobData.innerText.includes('(Remote)')) {
			jobData.classList.add(REMOTE_CLASS);
		}

		// Contract roles
		if (jobData.innerText.includes('contract')) {
			jobData.classList.add(CONTRACT_CLASS);
		}
		jobData.querySelectorAll('li').forEach((innerEl) => {
			// Salary
			CURRENCIES.forEach((currency) => {
				if (
					!innerEl.classList.contains(SALARY_CLASS) &&
					innerEl.innerText.includes(currency)
				)
					innerEl.classList.add(SALARY_CLASS);
			});

			// Time since posting
			timeStyling(innerEl);
		});
	});

	// Specific to saved jobs
	// document.querySelectorAll(JOB_ENTRY_ELEMENT.savedJobs);
};

createStyleSheet();
waitForElement(JOB_ENTRY_ELEMENT, applyStyling, true);
