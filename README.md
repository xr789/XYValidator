# XYValidator
web form validator


	公共可选参数:message 当验证不通过时提示的信息
1. cmd命令参数说明
	req(或required): 此表单项必须填写
		必须参数:无
		必须参数:minCheckedNum或maxCheckedNum 至少一项有效

	checked: 此表单项必须选中大于(等于)minCheckedNum(minCheckedNum>0) 小于(等于)maxCheckedNum(maxCheckedNum>minCheckedNum)
		必须参数:minCheckedNum或maxCheckedNum 至少一项有效

	len(或length): 此表单项内容长度需大于(等于)minLength小于(等于)maxLength
		必须参数:minLength或maxLength 至少一项有效

	int(或integer): 此表单项内容必须是数字且需大于(等于)minValue小于(等于)maxValue
		必须参数:无
		可选参数:minValue, maxValue 均可空

	date: 此表单项内容必须是合法的日期需晚于(等于)beginDate早于endDate
		必须参数:无
		可选参数:beginDate或endDate 至少一项有效

	float(或decimal): 此表单项内容必须是带小数数字需大于(等于)minValue小于(等于)maxValue
		必须参数:scale 小数位数(大于0),不可以空
		可选参数:minValue, maxValue 均可空

	tel(或CNTel): 此表单项内容必须是合法的中国固定电话号码
		必须参数:无

	mobile(或CNMobile): 此表单项内容必须是合法的中国的移动电话号码
		必须参数:无

	email: 此表单项内容必须是合法的Email地址
		必须参数:无

	regexp: 此表单项内容必须符合正则表达式regexp
		必须参数:regexp 正则表达式

	function: 此表单项内容通过function的返回true
		必须参数:function 待执行的function函数

	ajax: 此表单项内容通过ajax的验证返回true
		必须参数: {url:远程地址, sync:ajax是否是同步的(默认Y), successHandler:ajax成功回调函数, errorHandler:ajax异常回调函数}
