/**
 * ### Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2016<br />
 * Created 12.03.2016
 *
 * @module tools
 * @submodule tool_element
 */

/**
 * ### Виртуальный инструмент - прототип для инструментов _select_node_ и _select_elm_
 *
 * @class ToolElement
 * @extends paper.Tool
 * @constructor
 */
function ToolElement() {
	ToolElement.superclass.constructor.call(this);
}
ToolElement._extend(paper.Tool);

ToolElement.prototype.__define({

	/**
	 * Отключает и выгружает из памяти окно свойств инструмента
	 * @param tool
	 */
	detache_wnd: {
		value: function(){
			if(this.wnd){
				
				if(this._grid && this._grid.destructor){
					if(this.wnd.detachObject)
						this.wnd.detachObject(true);
					delete this._grid;
				}
				
				if(this.wnd.wnd_options){
					this.wnd.wnd_options(this.options.wnd);
					$p.wsql.save_options("editor", this.options);
					this.wnd.close();
				}
				
				delete this.wnd;
			}
			this.profile = null;
		}
	}

});
