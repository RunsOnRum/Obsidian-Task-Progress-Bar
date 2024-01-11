import { App, Editor, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { taskProgressBarExtension } from './taskProgressBarWidget';

interface TaskProgressBarSettings {
	addTaskProgressBarToHeading: boolean;
	progressBarWidth: string;
	addNumberToProgressBar: boolean;
	addPercentageToProgressBar: boolean;
	allowAlternateTaskStatus: boolean;
	alternativeMarks: string;
	countSubLevel: boolean;
}

const DEFAULT_SETTINGS: TaskProgressBarSettings = {
	addTaskProgressBarToHeading: false,
	progressBarWidth: '100',
	addNumberToProgressBar: false,
	addPercentageToProgressBar: false,
	allowAlternateTaskStatus: false,
	alternativeMarks: '(x|X|-)',
	countSubLevel: true,
}

export default class TaskProgressBarPlugin extends Plugin {
	settings: TaskProgressBarSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new TaskProgressBarSettingTab(this.app, this));
		this.registerEditorExtension(taskProgressBarExtension(this.app, this));

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TaskProgressBarSettingTab extends PluginSettingTab {
	plugin: TaskProgressBarPlugin;
	private applyDebounceTimer: number = 0;

	constructor(app: App, plugin: TaskProgressBarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	applySettingsUpdate() {
		clearTimeout(this.applyDebounceTimer);
		const plugin = this.plugin;
		this.applyDebounceTimer = window.setTimeout(() => {
			plugin.saveSettings();
		}, 100);
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: '📍 Task Progress Bar' });

		new Setting(containerEl)
			.setName('Add progress bar to Heading')
			.setDesc('Toggle this to allow this plugin to add progress bar for Task below the headings.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.addTaskProgressBarToHeading).onChange(async (value) => {
					this.plugin.settings.addTaskProgressBarToHeading = value;
					this.applySettingsUpdate();
				}));

			new Setting(containerEl)
			.setName('Progress Bar Width')
			.setDesc('Set the width of the progress bar, in pixels')
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.progressBarWidth)
					.setValue(this.plugin.settings.progressBarWidth)
					.onChange(async (value) => {
						if (value.length === 0 || !value.match(/^\d+$/)) {
							this.plugin.settings.progressBarWidth = DEFAULT_SETTINGS.progressBarWidth;
						} else {
							this.plugin.settings.progressBarWidth = value;
						}
						this.applySettingsUpdate();
					}),
			);

		new Setting(containerEl)
			.setName('Add number to the Progress Bar')
			.setDesc('Toggle this to allow this plugin to add tasks number to progress bar.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.addNumberToProgressBar).onChange(async (value) => {
					this.plugin.settings.addNumberToProgressBar = value;
					this.applySettingsUpdate();
				}));

		new Setting(containerEl)
		.setName('Add Percentage to the Progress Bar')
		.setDesc('Toggle this to allow this plugin to add tasks percentage to progress bar.')
		.addToggle((toggle) =>
			toggle.setValue(this.plugin.settings.addPercentageToProgressBar).onChange(async (value) => {
				this.plugin.settings.addPercentageToProgressBar = value;
				this.applySettingsUpdate();
			}));

		new Setting(containerEl)
			.setName('Only count children of current Task')
			.setDesc('Toggle this to allow this plugin to count the tasks in one level, but not in sub-levels.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.countSubLevel).onChange(async (value) => {
					this.plugin.settings.countSubLevel = value;
					this.applySettingsUpdate();
				}));

		new Setting(containerEl)
			.setName('Allow alternate task status')
			.setDesc('Toggle this to allow this plugin to treat different tasks mark as completed or uncompleted tasks.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.allowAlternateTaskStatus).onChange(async (value) => {
					this.plugin.settings.allowAlternateTaskStatus = value;
					this.applySettingsUpdate();
				}));

		new Setting(containerEl)
			.setName('Completed alternative marks')
			.setDesc('Set completed alternative marks here. Like "x|X|-"')
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.alternativeMarks)
					.setValue(this.plugin.settings.alternativeMarks)
					.onChange(async (value) => {
						if (value.length === 0) {
							this.plugin.settings.alternativeMarks = DEFAULT_SETTINGS.alternativeMarks;
						} else {
							this.plugin.settings.alternativeMarks = value;
						}
						this.applySettingsUpdate();
					}),
			);


		this.containerEl.createEl('h2', { text: 'Say Thank You' });

		new Setting(containerEl)
			.setName('Donate')
			.setDesc('If you like this plugin, consider donating to support continued development:')
			.addButton((bt) => {
				bt.buttonEl.outerHTML = `<a href="https://www.buymeacoffee.com/boninall"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=boninall&button_colour=6495ED&font_colour=ffffff&font_family=Inter&outline_colour=000000&coffee_colour=FFDD00"></a>`;
			});
	}
}
