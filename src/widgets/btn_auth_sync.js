/**
 *
 * Created 07.11.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @license content of this file is covered by Oknosoft Commercial license. Usage without proper license is prohibited. To obtain it contact info@oknosoft.ru
 * @author  Evgeniy Malyarov
 * @module  widgets
 * @submodule btn_auth_sync
 */

/**
 * ### Невизуальный компонент для управления кнопками авторизации и синхронизации на панелях инструментов
 * Изменяет текст, всплывающие подсказки и обработчики нажатий кнопок в зависимости от ...
 *
 * @class OBtnAuthSync
 * @constructor
 */
function OBtnAuthSync() {

	var bars = [], spin_timer;

	//$(t.tb_nav.buttons.bell).addClass("disabledbutton");

	function btn_click(){

		if($p.wsql.pouch.authorized)
			dhtmlx.confirm({
				title: $p.msg.log_out_title,
				text: $p.msg.logged_in + $p.wsql.pouch.authorized + $p.msg.log_out_break,
				cancel: $p.msg.cancel,
				callback: function(btn) {
					if(btn){
						$p.wsql.pouch.log_out();
					}
				}
			});
		else
			$p.iface.frm_auth({
				modal_dialog: true
				//, try_auto: true
			});
	}

	function sync_mouseover(){

	}

	function sync_mouseout(){

	}

	function set_spin(spin){

		if(spin && spin_timer){
			clearTimeout(spin_timer);

		}else{
			bars.forEach(function (bar) {
				if(spin)
					bar.buttons.sync.innerHTML = '<i class="fa fa-refresh fa-spin md-fa-lg"></i>';
				else{
					if($p.wsql.pouch.authorized)
						bar.buttons.sync.innerHTML = '<i class="fa fa-refresh md-fa-lg"></i>';
					else
						bar.buttons.sync.innerHTML = '<i class="fa fa-ban md-fa-lg"></i>';
				}
			});
		}
		spin_timer = spin ? setTimeout(set_spin, 3000) : 0;
	}

	function set_auth(){

		bars.forEach(function (bar) {

			if($p.wsql.pouch.authorized){
				bar.buttons.auth.title = $p.msg.logged_in + $p.wsql.pouch.authorized;
				bar.buttons.auth.innerHTML = '<i class="fa fa-sign-out md-fa-lg"></i>';
				bar.buttons.sync.title = "Синхронизация выполняется...";
				bar.buttons.sync.innerHTML = '<i class="fa fa-refresh md-fa-lg"></i>';
			}else{
				bar.buttons.auth.title = "Войти на сервер и включить синхронизацию данных";
				bar.buttons.auth.innerHTML = '<i class="fa fa-sign-in md-fa-lg"></i>';
				bar.buttons.sync.title = "Синхронизация не выполняется - пользователь не авторизован на сервере";
				bar.buttons.sync.innerHTML = '<i class="fa fa-ban md-fa-lg"></i>';
					//'<i class="fa fa-refresh fa-stack-1x"></i>' +
					//'<i class="fa fa-ban fa-stack-2x text-danger"></i>' +
					//'</span>';
			}
		})
	}

	/**
	 * Привязывает обработчики к кнопке
	 * @param btn
	 */
	this.bind = function (bar) {
		bar.buttons.auth.onclick = btn_click;
		//bar.buttons.auth.onmouseover = null;
		//bar.buttons.auth.onmouseout = null;
		bar.buttons.sync.onclick = null;
		bar.buttons.sync.onmouseover = sync_mouseover;
		bar.buttons.sync.onmouseout = sync_mouseout;
		bars.push(bar);
		setTimeout(set_auth);
	};

	$p.eve.attachEvent("pouch_load_data_start", function (page) {

		if(!$p.iface.sync)
			$p.iface.wnd_sync();
		$p.iface.sync.create($p.eve.stepper);
		$p.eve.stepper.frm_sync.setItemValue("text_bottom", "Читаем справочники");

		if(page.hasOwnProperty("local_rows") && page.local_rows < 10){
			$p.eve.stepper.wnd_sync.setText("Первый запуск - подготовка данных");
			$p.eve.stepper.frm_sync.setItemValue("text_processed", "Загрузка начального образа");
		}else{
			$p.eve.stepper.wnd_sync.setText("Загрузка данных из IndexedDB");
			$p.eve.stepper.frm_sync.setItemValue("text_processed", "Извлечение начального образа");
		}

		set_spin(true);
	});

	$p.eve.attachEvent("pouch_load_data_page", function (page) {
		set_spin(true);
		if($p.eve.stepper.wnd_sync){
			var docs_written = page.docs_written || page.page * page.limit;
			$p.eve.stepper.frm_sync.setItemValue("text_current", "Обработано элементов: " + docs_written + " из " + page.total_rows);
			$p.eve.stepper.frm_sync.setItemValue("text_bottom", "Текущий запрос: " + page.page + " (" + (100 * docs_written/page.total_rows).toFixed(0) + "%)");
		}
	});

	$p.eve.attachEvent("pouch_change", function (id, page) {
		set_spin(true);
	});

	/**
	 * Завершение начальной синхронизации либо загрузки данных при старте
	 */
	$p.eve.attachEvent("pouch_load_data_loaded", function (page) {
		if($p.eve.stepper.wnd_sync){
			if(page.docs_written){
				setTimeout(function () {
					$p.iface.sync.close();
					$p.eve.redirect = true;
					location.reload(true);
				}, 3000);
			}else{
				$p.iface.sync.close();
			}
		}
	});

	$p.eve.attachEvent("pouch_load_data_error", function (err) {
		set_spin();
		if($p.eve.stepper.wnd_sync)
			$p.iface.sync.close();
	});

	$p.eve.attachEvent("log_in", function (username) {
		set_auth();
	});

	$p.eve.attachEvent("log_out", function () {
		set_auth();
	});

}

