/**
 * форма списка документов Расчет-заказ. публикуемый метод: doc.calc_order.form_list(o, pwnd, attr)
 */

$p.modifiers.push(
	function($p) {

		var _mgr = $p.doc.calc_order;

		_mgr.form_list = function(pwnd, attr){
			
			if(!attr)
				attr = {
					hide_header: true,
					date_from: new Date((new Date()).getFullYear().toFixed() + "-01-01"),
					date_till: new Date((new Date()).getFullYear().toFixed() + "-12-31"),
					on_new: function (o) {
						$p.iface.set_hash(_mgr.class_name, o.ref);
					},
					on_edit: function (_mgr, rId) {
						$p.iface.set_hash(_mgr.class_name, rId);
					}
				};

			// разбивка на 2 колонки - дерево и карусель
			var layout = pwnd.attachLayout({
				pattern: "2U",
				cells: [{
					id: "a",
					text: "Фильтр",
					collapsed_text: "Фильтр",
					width: 180
				}, {
					id: "b",
					text: "Заказы",
					header: false
				}],
				offsets: { top: 0, right: 0, bottom: 0, left: 0}
			}),

				tree = layout.cells("a").attachTree(),

				carousel = layout.cells("b").attachCarousel({
					keys:           false,
					touch_scroll:   false,
					offset_left:    0,
					offset_top:     0,
					offset_item:    0
				});

			// страницы карусели
			carousel.hideControls();
			carousel.addCell("list");
			carousel.addCell("report");
			carousel.conf.anim_step = 200;
			carousel.conf.anim_slide = "left 0.1s";

			var wnd = _mgr.form_selection(carousel.cells("list"), attr),

				report,

				filter_view = {},
				
				filter_key = {};

			// настраиваем фильтр для списка заказов
			filter_view.__define({
				value: {
					get: function () {
						switch(tree.getSelectedItemId()) {

							case 'draft':
							case 'sent':
							case 'declined':
							case 'confirmed':
							case 'template':
							case 'zarchive':
								return 'doc/doc_calc_order_date';

							case 'execution':
							case 'plan':
							case 'underway':
							case 'manufactured':
							case 'executed':
							case 'all':
								return '';
						}
					}
				}
			});
			filter_key.__define({
				value: {
					get: function () {
						var key;

						switch(tree.getSelectedItemId()) {

							case 'draft':
								key = 'draft';
								break;
							case 'sent':
								key = 'sent';
								break;
							case 'declined':
								key = 'declined';
								break;
							case 'confirmed':
								key = 'confirmed';
								break;
							case 'template':
								key = 'template';
								break;
							case 'zarchive':
								key = 'zarchive';
								break;

							case 'execution':
							case 'plan':
							case 'underway':
							case 'manufactured':
							case 'executed':
							case 'all':
								return '';
						}

						var filter = wnd.elmnts.filter.get_filter(true);
						return {
							startkey: [key, filter.date_from.getFullYear(), filter.date_from.getMonth()+1, filter.date_from.getDate()],
							endkey: [key, filter.date_till.getFullYear(), filter.date_till.getMonth()+1, filter.date_till.getDate()],
							_drop_date: true,
							_order_by: true,
							_search: filter.filter.toLowerCase()
						};
					}
				}
			});
			wnd.elmnts.filter.custom_selection._view = filter_view;
			wnd.elmnts.filter.custom_selection._key = filter_key;

			// картинка заказа в статусбаре
			wnd.elmnts.svgs = new $p.iface.OSvgs($p.doc.calc_order, wnd, wnd.elmnts.status_bar);
			wnd.elmnts.grid.attachEvent("onRowSelect", function (rid) {
				wnd.elmnts.svgs.reload(rid);
			});

			// настраиваем дерево
			tree.enableTreeImages(false);
			tree.parse($p.injected_data["tree_filteres.xml"]);
			tree.attachEvent("onSelect", function (rid) {

				// переключаем страницу карусели
				switch(rid) {

					case 'draft':
					case 'sent':
					case 'declined':
					case 'confirmed':
					case 'template':
					case 'zarchive':
					case 'all':
						carousel.cells("list").setActive();
						wnd.elmnts.filter.call_event();
						return;
				}

				build_report(rid);

			});

			function build_report(rid) {

				carousel.cells("report").setActive();

				var data = [
					['', 'Kia', 'Nissan', 'Toyota', 'Honda'],
					['2008', 10, 11, 12, 13],
					['2009', 20, 11, 14, 13],
					['2009', 30, 15, 12, 13]
				];

				if(!report){

					report = new $p.HandsontableDocument(carousel.cells("report"), {})

						.then(function (rep) {

							if(!rep._online)
								return report = null;

							rep.hot = Handsontable(rep._cont, {
								data: data,
								minRows: 6,
								minCols: 6,
								minSpareRows: 1,
								// currentRowClassName: 'currentRow',
								// currentColClassName: 'currentCol',
								autoWrapRow: true,
								rowHeaders: true,
								colHeaders: true
							});

							rep.hot.selectCell(3,3);

						});

				}else if(report._online){
					data[1][1]+=1;
					report.hot.selectCell(3,3);
				}

				switch(rid) {

					case 'execution':
					case 'plan':
					case 'underway':
					case 'manufactured':
					case 'executed':

						break;
				}
			}

			return wnd;
		};
	}
);
