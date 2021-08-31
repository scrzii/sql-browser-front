window.onload = function() {
	var login_form = document.getElementById("form")
	var submit_button = document.getElementById("submit")
	var loader = document.getElementById("loader")
	var switch_button = document.getElementsByClassName("switch_button")[0]
	var filter_block = document.getElementsByClassName("filter_block")[0]
	var filter_switcher = document.getElementsByClassName("filter_switcher")[0]
	var selector = document.getElementsByClassName("selector")[0]
	var selector_hider = document.getElementById("hider")
	var selector_options = document.getElementsByClassName("selector_option")
	var selector_selected = document.getElementById("selected")
	
	for (i = 1; i < selector_options.length; i++) {
		selector_options[i].onclick = function() {
			var last_instance = this
			setTimeout(function() {
				selector_selected.innerText = last_instance.innerText
				selector_hider.className = "selector_hider"
			}, 1)
		}
	}
	
	selector.onclick = function() {
		if (selector_hider.className == "selector_hider") {
			selector_hider.className = "selector_hider opened"
		} else {
			selector_hider.className = "selector_hider"
		}
	}
	
	filter_switcher.onclick = function() {
		if (switch_button.className.split(" ").indexOf("switched") > -1) {
			switch_button.className = "switch_button"
			filter_block.className = "filter_block hidden"
		} else {
			switch_button.className = "switch_button switched"
			filter_block.className = "filter_block"
		}
	}
	
	function loaderOn() {
		loader.className = "loader_block active"
	}
	
	function loaderOff() {
		loader.className = "loader_block"
	}
	
	document.getElementById("sign_in").onclick = function() {
		login_form.className = "loader_block active"
	}
	
	submit_button.onclick = function() {
		login_form.className = "loader_block"
		loaderOn()
		setTimeout(function() {
			loaderOff()
		}, 2000)
	}
}