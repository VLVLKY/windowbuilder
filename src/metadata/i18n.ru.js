/**
 * Строковые константы интернационализации
 */

export default function ($p) {

  Object.assign($p.msg.i18n.ru, {
    main_title: "Заказ дилера ",
    additional_inserts: "Доп. вставки",
    align_node_right: "Уравнять вертикально вправо",
    align_node_bottom: "Уравнять горизонтально вниз",
    align_node_top: "Уравнять горизонтально вверх",
    align_node_left: "Уравнять вертикально влево",
    align_set_right: "Установить размер сдвигом правых элементов",
    align_set_bottom: "Установить размер сдвигом нижних элементов",
    align_set_top: "Установить размер сдвигом верхних элементов",
    align_set_left: "Установить размер сдвигом левых элементов",
    align_all: "Установить прямые углы",
    align_invalid_direction: "Неприменимо для элемента с данной ориентацией",

    arc_invalid_elm = "Укажите профиль на эскизе",

    bld_constructor: "Конструктор объектов графического построителя",
    bld_title: "Графический построитель",
    bld_empty_param: "Не заполнен обязательный параметр <br />",
    bld_not_product: "В текущей строке нет изделия построителя",
    bld_not_draw: "Отсутствует эскиз или не указана система профилей",
    bld_not_sys: "Не указана система профилей",
    bld_from_blocks_title: "Выбор типового блока",
    bld_from_blocks: "Текущее изделие будет заменено конфигурацией типового блока. Продолжить?",
    bld_split_imp: "В параметрах продукции<br />'%1'<br />запрещены незамкнутые контуры<br />" +
  "Для включения деления импостом,<br />установите это свойство в 'Истина'",
    bld_new_stv: "Добавить створку",
    bld_new_stv_no_filling: "Перед добавлением створки, укажите заполнение,<br />в которое поместить створку",

    del_elm: "Удалить элемент",

    glass_spec: "Состав заполнения",

    to_contour: "в контур",
    to_elm: "в элемент",
    to_product: "в изделие",

    ruler_elm: "Расстояние между элементами",
    ruler_node: "Расстояние между узлами",
    ruler_new_line: "Добавить размерную линию",

    ruler_base: "По опорным линиям",
    ruler_inner: "По внутренним линиям",
    ruler_outer: "По внешним линиям"

})
}


