const CLOSER_BUTTON = "closer_button"

var block_message, filter, selector, login_form, sign_in, message_controller

function modifyHidable(element) {
	function getState(el) {
		return el.classList.contains("active")
	}

	element.hide = function() {
		if (getState(element))
			element.classList.remove("active")
	}

	element.show = function() {
		if (!getState(element))
			element.classList.add("active")
	}

	element.switchState = function() {
		if (getState(element))
			element.hide()
		else
			element.show()
	}
}

function reviveTemplate(template_object, tag_name) {
	element = document.createElement(tag_name)
	element.className = template_object.className
	element.innerHTML = template_object.innerHTML
	return element
}

class FilterController {
	constructor(switcher_id, filter_id, template_id) {
		let switcher = document.getElementById(switcher_id)
		let filter_group = document.getElementById(filter_id)
		this.container = filter_group.getElementsByClassName("filter_container")[0]
		this.element_template = document.getElementById(template_id)
		modifyHidable(filter_group)

		switcher.onclick = function(e) {
			filter_group.switchState()
		}
	}

	createNewFilter(filter_name) {
		let el = reviveTemplate(this.element_template, "div")
		el.getElementsByTagName("div")[0].innerHTML = filter_name
		return el
	}

	setFilters(filter_list) {
		while (this.container.childNodes.length > 0) {
			this.container.removeChild(this.container.childNodes[0])
		}

		for (let i = 0; i < filter_list.length; i++) {
			this.container.appendChild(this.createNewFilter(filter_list[i]))
		}
	}
}

class Loader {
	static loaderId = "loader"
	static element = null

	static init() {
		Loader.element = document.getElementById(Loader.loaderId)
		modifyHidable(Loader.element)
	}

	static show() {
		Loader.element.show()
	}

	static hide() {
		Loader.element.hide()
	}
}

class AlertController {
	constructor(alert_id) {
		this.alert = document.getElementById(alert_id)
		this.alert.controller = this
		
		let close_button = this.alert.querySelector("[name=close]")
		close_button.parent = this
		close_button.onclick = function(e) {
			this.parent.hide()
		}

		this.text = Array.from(this.alert.getElementsByTagName("div")).filter(_ => _.getAttribute("name") == "text")[0]
		modifyHidable(this.alert)
	}

	show(text) {
		this.text.innerHTML = text.slice()
		this.alert.show()
	}

	hide() {
		this.alert.hide()
	}
}

class SelectorController {
	constructor(selector_id, selected_header_id, template_id, option_list_id) {
		this.selector = document.getElementById(selector_id)
		this.header = document.getElementById(selected_header_id)
		this.header.controller = this
		this.container = document.getElementById(option_list_id)
		this.element_template = document.getElementById(template_id)
		modifyHidable(this.container)

		this.header.onclick = function(e) {	
			this.controller.open()
		}
	}

	open() {
		this.container.show()
	}

	close() {
		this.container.hide()
	}

	createNewOption(option_name) {
		let el = reviveTemplate(this.element_template, "div")
		el.innerHTML = option_name
		el.controller = this
		el.onclick = function(e) {
			this.controller.setSelectedValue(this.innerHTML)
			this.controller.close()
		}
		return el
	}

	setOptions(option_list) {
		while (this.container.childNodes.length > 0) {
			this.container.removeChild(this.container.childNodes[0])
		}

		for (let i = 0; i < option_list.length; i++) {
			this.container.appendChild(this.createNewOption(option_list[i]))
		}
	}

	setSelectedValue(value) {
		this.header.innerHTML = value
		this.selectAction()
	}

	getSelectedValue() {
		return this.header.innerHTML.slice()
	}

	selectAction() { /* Override me */ }
}

class TableController {
	constructor(table_id, naming_template_id, regular_template_id, cell_template_id, sorter_template_id, new_button_id, remove_button_id) {
		this.table = document.getElementById(table_id)
		this.naming_template = document.getElementById(naming_template_id)
		this.regular_template = document.getElementById(regular_template_id)
		this.cell_template = document.getElementById(cell_template_id)
		this.sorter_template = document.getElementById(sorter_template_id)
		this.new_template = document.getElementById(new_button_id)
		this.remove_template = document.getElementById(remove_button_id)
		this.rows = []
	}

	
	clear() {
		while (this.table.childNodes.length > 0) {
			this.table.removeChild(this.table.childNodes[0])
		}
		this.rows = []
	}
	
	addRow() {
		let row_template = this.rows.length > 0 ? this.regular_template : this.naming_template
		let new_row = new TableController.Row(row_template, this.cell_template, this.sorter_template, this.new_template, this.remove_template)
		this.table.appendChild(new_row.row_object)
		this.rows.push(new_row)
		this.rows.at(-1).controller = this
	}

	addCell(value) {
		let last_row = this.rows.at(-1)
		last_row.addCell(value)
	}

	addButton() {
		let button_template = this.rows.length == 1 ? this.new_template : this.remove_template
		this.rows.at(-1).addButton(button_template)
		this.rows.at(-1).cells.at(-1).controller = this.rows.at(-1)
	}

	removeRow(index) {
		let row = this.rows[index].row_object
		this.table.removeChild(row)
		this.rows.splice(index, 1)
	}

	getRow(index) {
		return this.rows[index]
	}

	moveSorter(index) {
		this.getRow(0).moveSorter(index)
	}

	getColumnName(index) {
		return this.rows[0].getValue(index)
	}

	clickAction(row, col_index) {
		let row_index = this.rows.indexOf(row)
		if (col_index == this.rows[0].cells.length - 1) {
			this.addRemoveAction(row_index)
			return
		}
		if (row_index == 0) {
			this.nameClickAction(col_index)
		}
	}

	nameClickAction(col_index) {
		/* Override me */
		console.log(`You clicked on name ${this.getColumnName(col_index)}`)
	}

	addRemoveAction(row_index) {
		/* Override me */
		console.log(`You clicked on button ${row_index}`)
	}
}

TableController.Row = class {
	constructor(row_template, cell_template, sorter_template, new_template, remove_template) {
		this.row_object = reviveTemplate(row_template, "tr")
		this.sorter_template = sorter_template
		this.cell_template = cell_template
		this.cells = []
		this.new_template = new_template
		this.remove_template = remove_template
	}

	getValue(index) {
		let value = this.cells[index].cell_object.innerText
		return this.getSortedIndex() == index ? value.slice(0, value.indexOf("\n")) : value
	}

	getSortedIndex() {
		let cells_sorted = this.cells.map(_ => _.isSorted())
		return cells_sorted.indexOf(true)
	}

	getSortedState() {
		let sorted_index = this.getSortedIndex()
		return this.cells[sorted_index].getSortedState()
	}

	getIndex(cell) {
		return this.cells.indexOf(cell)
	}

	moveSorter(index) {
		if (this.getSortedIndex() == index) {
			this.cells[index].reverseSorted()
			return
		}

		for (let i = 0; i < this.cells.length; i++) {
			this.cells[i].makeUnsorted()
		}
		this.cells[index].makeSorted()
	}

	clear() {
		while (this.cells.length > 0) {
			this.row_object.removeChild(this.cells[0].cell_object)
		}
		this.cells = []
	}

	addButton(button_template) {
		let new_cell = new TableController.Row.Cell("", button_template, this.sorter_template, "button")
		new_cell.controller = this
		this.row_object.appendChild(new_cell.cell_object)
		this.cells.push(new_cell)
	}

	addCell(value) {
		let new_cell = new TableController.Row.Cell(value, this.cell_template, this.sorter_template)
		new_cell.controller = this
		this.row_object.appendChild(new_cell.cell_object)
		this.cells.push(new_cell)
	}

	clickAction(cell) {
		this.controller.clickAction(this, this.cells.indexOf(cell))
	}
}

TableController.Row.Cell = class {
	constructor(value, cell_template, sorter_template) {
		this.cell_object = reviveTemplate(cell_template, "td")
		if (value) {
			this.cell_object.innerHTML = value.slice()
		}
		this.cell_object.controller = this
		this.cell_object.onclick = function(e) {
			let cell = this.controller
			cell.controller.clickAction(cell)
		}

		this.sorter_template = sorter_template
		this.sorters = document.getElementsByClassName(sorter_template.className)
	}

	isSorted() {
		return this.cell_object.getElementsByClassName(this.sorter_template.className).length > 0
	}

	getSortedState() {
		return !this.sorters[0].style
	}

	makeSorted() {
		if (this.sorters.length > 0) {
			return
		}

		this.cell_object.appendChild(reviveTemplate(this.sorter_template, "p"))
	}

	reverseSorted() {
		if (this.sorters.length > 0) {
			this.sorters[0].style = this.sorters[0].style.transform ? "" : "transform: rotate(180deg)"
		}
	}

	makeUnsorted() {
		if (this.sorters.length > 0) {
			this.cell_object.removeChild(this.sorters[0])
		}
	}
}

class MessageController {
	constructor(list_id, template_id) {
		this.list = document.getElementById(list_id)
		this.template = document.getElementById(template_id)
	}

	show(text, timeout=0) {
		let closer_function = function(closer_button) {
				try {
					closer_button.parent.removeChild(closer_button.to_remove)
				} catch {
					console.log("Already removed")
				}
			}

		let message = reviveTemplate(this.template, "div")
		let closer = message.getElementsByClassName("message_closer")[0]
		closer.parent = this.list
		closer.to_remove = message
		let text_object = message.getElementsByClassName("message_text")[0]
		text_object.innerHTML = text
		closer.onclick = function(e) { closer_function(this) }
		this.list.appendChild(message)

		if (timeout > 0) {
			setTimeout(function() {
				closer_function(closer)
			}, timeout)
		}
	}
}

class FormController {
	constructor(form_template_id, hidable=false, remove_time=1000) {
		this.template = document.getElementById(form_template_id)
		this.hidable = hidable
		this.remove_time = remove_time
	}

	create() {
		this.form_object = reviveTemplate(this.template, "div")
		this.form_object.controller = this
		if (this.hidable) {
			modifyHidable(this.form_object)
			document.body.appendChild(this.form_object)
			setTimeout(function(obj) {
				obj.form_object.show()
			}, 0, this)
		}

		let closer = this.getMember("close")
		closer.main_object = this
		closer.onclick = function(e) {
			this.main_object.terminate()
		}
		
		this.onCreate()
	}

	terminate() {
		this.form_object.hide()
		setTimeout(function(obj) {
			obj.parentElement.removeChild(obj)
		}, this.remove_time, this.form_object)
	}

	getMember(name) {
		let children = Array.from(this.form_object.getElementsByTagName("*"))
		return children.filter(_ => _.getAttribute("name") == name)[0]
	}

	onCreate() {
		/* Override me */
	}
}

class LoginFormController extends FormController {
	constructor(template_id, hidable=false) {
		super(template_id, hidable)
	}

	onCreate() {
		this.submit = this.getMember("submit")
		this.submit.main_object = this
		this.submit.onclick = function(e) {
			this.main_object.terminate()
			Loader.show()
			setTimeout(function() { Loader.hide() }, 2000)
			block_message.show(`Вы попытались войти: ${this.main_object.getLogin()}:${this.main_object.getPassword()}`)
		}

		this.login = this.getMember("login")
		this.password = this.getMember("password")
	}

	getLogin() {
		return this.login.value
	}

	getPassword() {
		return this.password.value
	}
}

class ValueController extends FormController {
	constructor(template_id, hidable) {
		super(template_id, hidable)
	}
	
	onCreate() {
		this.submit = this.getMember("submit")
		this.submit.main_object = this
		this.submit.onclick = function(e) {
			this.main_object.terminate()
			Loader.show()
			setTimeout(function() { Loader.hide() }, 2000)
			block_message.show(`Ваше значение: ${this.main_object.getValue()}`)
		}
	
		this.value = this.getMember("value")
	}

	getValue() {
		return this.value.value
	}
}

function mainSelectorSelected() {
	console.log(`You selected ${this.getSelectedValue()}`)
}

window.onload = function() {
	Loader.init()

	block_message = new AlertController("alert")

	filter = new FilterController("filter_switcher", "filter", "filter_template")
	filter.setFilters(["Filter", "filter2"])

	selector = new SelectorController("table_selector", "selected", "selector_template", "hider")
	selector.setOptions(["Option1", "Option2", "Option3"])
	selector.selectAction = mainSelectorSelected
	
	login_form = new LoginFormController("login_template", true)
	sign_in = document.querySelector("#sign_in")
	sign_in.onclick = function(e) {
		login_form.create(true)
	}

	var table = new TableController("main_table", "naming_template", "regular_template", "cell_template", "sorter_template", "new_button", "remove_button")
	table.clear()
	table.addRow()
	table.addCell("Column 1")
	table.addCell("Column 2")
	table.addButton()
	table.addRow()
	table.addCell("Value 1 column 1")
	table.addCell("Value 2")
	table.addButton()
	table.moveSorter(0)

	message_controller = new MessageController("popup_list", "popup_template")
	message_controller.show("TEXT", 3000)
	message_controller.show("TEXT", 1000)
	message_controller.show("TEXT")

	var value_controller = new ValueController("value_template", true)
	setTimeout(function() {value_controller.create()}, 1000)
}