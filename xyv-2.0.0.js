(function(){
	function XYV(formId, customerSetting){
		this.version="2.0.0";
		this.param={obj:{},qs:""};
		this.toString=function(){
			return "XYV "+ this.version;
		};
		if(formId==undefined){
			alert("formId is undefined!");
			return;
		}
		this.form=document.forms[formId];
		if(this.form==null){
			alert("找不到表单:"+formId);
			return;
		}
		if(customerSetting==undefined){
			customerSetting={};
		}
		this.form["xyv"]=this;

		/**
		 * 消息对象Map
		 * */
		this.tipObjectMap=[];

		/**
		 * 全局设置
		 * */
		this.globeSetting={};

		/**
		 * 拷贝属性
		 * */
		this.copyProp=function(dest, orgi, key, defaultValue){
			dest[key] = orgi[key]!=undefined?orgi[key]:(defaultValue!=undefined?defaultValue:null);
		}
		/*设置属性*/
		this.setProp=function(dest, key, defaultValue){
			if(dest[key]==undefined || dest[key]==null || dest[key]==""){
				dest[key]=defaultValue!=undefined?defaultValue:null;
			}
		}
		//获取属性 有优先从当前配置中读取,如果null 去全局配置中获取 最后
		//参数当前配置, 属性名称, 类型
		this.getProp=function(contextArray, propName, type){
			if(contextArray==null || this.isArray(contextArray)==false || propName==null || (typeof propName).toLowerCase()!="string"){return null;}
			var val=null;
			for(var i=0;i<contextArray.length;i++){
				val=contextArray[i][propName];
				if(val==null){//空值
					continue;
				}else{//有值
					if(type==undefined || type==null){//类型不做判断
						break;
					}else{
						if((typeof val).toLowerCase()==type){//类型一致
							break;
						}else{//类型不一致
							val=null;
						}
					}
				}
			}
			/*var val=ruleObj[propName];
			if(val==null || (type!=null&&(typeof val).toLowerCase()!==type) ){
				val=this.globeSetting[propName];
			}
			if(val!=null && type!=null && (typeof val).toLowerCase()!==type){
				val=null;
			}*/
			return val;
		};

		/**
		 * 克隆对象
		 * @param obj 待克隆对象
		 * */
		this.clone=function(obj){
			if(obj==undefined || obj==null){
				return null;
			}
			var newObj={};
			for(var k in obj){
				if((typeof obj[k]).toLowerCase()==="object"){
					newObj[k]=this.clone.call(this, obj[k]);
				}else{
					newObj[k]=obj[k];
				}
			}
			return newObj;
		};

		/**
		 * 去除首尾空格
		 * */
		this.trim=function(str){
			return str==null||str==undefined?str:str.replace(/(^\s*)|(\s*$)/g,"");
		};

		/**
		 * 参数是否为空
		 * @return true||false
		 * */
		this.isEmpty=function(str){
			if(str==null){
				return true;
			}
			if((typeof str).toLowerCase()!="string"){
				return false;
			}
			return str==null||str==undefined?true:str.length<1;
		};	

		/**
		 * 是否是Array数组
		 * */
		this.isArray=function(arr){
			return Object.prototype.toString.apply(arr)==='[object Array]';
		};

		/**
		 * 检查类型
		 * @param obj 待检查对象 必须参数
		 * @param type 预计类型 必须参数
		 * @param valueList 取值列表,必须是Array 非必需参数
		 * @return 
		 */
		this.checkType=function(obj, type, valueList){
			if(obj==undefined || obj==null){
				return false;
			}
			if((typeof obj).toLowerCase()!=type.toLowerCase()){
				return false;
			}
			if(this.isArray(valueList)){
				var fl=false;
				for(var i=0;i<valueList.length;i++){
					if(obj==valueList[i]){
						fl=true;break;
					}
				}
				if(fl==false){
					return false;
				}
			}
			return true;
		};
		/**
		 * 根据给定的格式解析日期时间字符串
		 * */
		this.parseDate=function(dataString, format){
			if(format==undefined||format==null||format===""){
				format=this.getProp([this.globeSetting], "dateTimeFormat", "string");
			}
			var regexp = format.replace(/\-/g, "\\-").replace(/\./g,"\\.").replace(/\//g, '\\/')
					.replace('yyyy', '[1-9]{1}[0-9]{3}').replace('MM', '(0[1-9]{1}|1[012]{1})').replace('dd', '([1-2][0-9]{1}|0[1-9]{1}|3[01]{1})')
					.replace('HH', '([01]{1}[0-9]{1}|2[0-3]{1})').replace('mm', '([0-5]{1}[0-9]{1})').replace('ss', '([0-5]{1}[0-9]{1})').replace('SSS', '([0-9]{3})');
			if(new RegExp('^'+regexp+'$').test(dataString)==false){//日期不符合指定的格式
				return null;
			}
			var dtmMap={'yyyy':1, 'MM':1, 'dd':1, 'HH':0, 'mm':0, 'ss':0, 'SSS':0};
			var dtMap={};
			for(var k in dtmMap){
				var sp = format.indexOf(k);
				if(sp==-1){
					if(dtmMap[k]===1){
						return null;
					}else{
						continue;
					}
				}
				dtMap[k]=parseInt(dataString.substring(sp, sp+k.length), 10);
			}
			//校验日期部分
			switch(dtMap["MM"]){
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				break;
			case 4:
			case 6:
			case 9:
			case 11://4,6,9,11月份只有30天
				if(dtMap['dd']>30){return null;}
				break;
			case 2://平年28天闰年29天
				var mfds=28;
				if(dtMap['dd']%4==0){//能被4整除
					if(dtMap['dd']%100!=0){//不能被100 整除
						mfds=29;
					}else{
						if(dtMap['dd']%400==0){//能被400整除
							mfds=29;
						}
					}
				}
				if(dtMap['dd']>mfds){
					return null;
				}
				break;
			}
			var returnDate = new Date(0);
			returnDate.setFullYear(dtMap["yyyy"]);
			returnDate.setMonth(dtMap["MM"]-1);
			returnDate.setDate(dtMap["dd"]);
			if(isNaN(dtMap["HH"])==false && dtMap["HH"]!=null){
				returnDate.setHours(dtMap["HH"]);
				if(isNaN(dtMap["mm"])==false && dtMap["mm"]!=null){
					returnDate.setMinutes(dtMap["mm"]);
					if(isNaN(dtMap["ss"])==false && dtMap["ss"]!=null){
						returnDate.setSeconds(dtMap["ss"]);
						if(isNaN(dtMap["SSS"])==false && dtMap["SSS"]!=null){
							returnDate.setMilliseconds(dtMap["SSS"]);
						}
					}
				}
			}else{
				returnDate.setHours(0);
			}
			return returnDate;
		};

		this.copyProp(this.globeSetting, customerSetting, "dateTimeFormat", "yyyy-MM-dd HH:mm:ss");//默认日期时间格式
		this.copyProp(this.globeSetting, customerSetting, "dateFormat", "yyyy-MM-dd");//默认日期时间格式
		this.copyProp(this.globeSetting, customerSetting, "triggerEvent", "blur");//默认触发校验事件类型:失去焦点事件
		this.copyProp(this.globeSetting, customerSetting, "verifyOnFormSubmit", "Y");//提交表单时是否验证当前规则
		this.copyProp(this.globeSetting, customerSetting, "shortVerify", "Y");//短路校验:true
		this.copyProp(this.globeSetting, customerSetting, "autoTrim", "Y");//验证表单前是否自动去除首位空格
		this.copyProp(this.globeSetting, customerSetting, "scrollFirstErrorInput", "Y");//验证失败时,是否自动跳转到第一个验证失败表单域处
		this.copyProp(this.globeSetting, customerSetting, "focusFirstErrorInput", "N");//验证失败时,是否将光标定位第一个验证失败表单域
		this.copyProp(this.globeSetting, customerSetting, "displayCorrectTip", "N");//验证成功时,是否显示成功提示, 如果此处设置'Y', 则 验证通过后不会显示'info'消息
		this.copyProp(this.globeSetting, customerSetting, "displayInfoTip", "Y");//未验证或验证成功时,是否显示一般提示
		this.copyProp(this.globeSetting, customerSetting, "hideTipOnFocus", "Y");//当关联的input获得焦点后是否隐藏错误提示(信息提示不隐藏)
		this.copyProp(this.globeSetting, customerSetting, "tipLocation", "right");//提示消息位置 默认 右侧'right'
		this.copyProp(this.globeSetting, customerSetting, "validateErrorInputClassName");//验证不通过时input样式名称
		this.copyProp(this.globeSetting, customerSetting, "tipClassNameArray");//提示DIV样式名称(依次为 '验证成功' , '验证失败' , '默认提示')[null,null,null]

		this.copyProp(this.globeSetting, customerSetting, "tipMarginLeft", 10);//距左像素数, 当提示消息在input右侧显示时有效
		this.copyProp(this.globeSetting, customerSetting, "tipMarginTop", 10);//距上像素数, 当提示消息在input下侧显示时有效
		this.copyProp(this.globeSetting, customerSetting, "tipMarginBottom", 10);//距下像素数, 当提示消息在input上侧显示时有效
		
		this.copyProp(this.globeSetting, customerSetting, "beforeSubmit", function(){return true;});//表单验证通过提交表单前执行的函数
		this.copyProp(this.globeSetting, customerSetting, "afterSubmit", function(){});//表单验证通过提交表单后执行的函数

		//公共(共享)提示style
		this.copyProp(this.globeSetting, customerSetting, "sharedStyle", {display:'block',position:'absolute',width:'auto',cursor:'pointer','z-index':999,width:'auto','line-height':'24px',padding:'0 5px','font-size':'12px','background-color':'#fff'});//,height:'24px', _top:'2px'
		//验证错误提示style
		this.copyProp(this.globeSetting, customerSetting, "errorStyle", {color:'#e00', border:'1px solid #EED97C'});
		//验证通过提示style
		this.copyProp(this.globeSetting, customerSetting, "correctStyle", {color:'#309100', border:'0px'});
		//默认提示style
		this.copyProp(this.globeSetting, customerSetting, "infoStyle", {color:'#666', border:'1px solid #DDD'});

		//必填校验(input:待验证表单项)
		this.testRequired=function(input, ruleObj){
			var tagName=input.tagName.toLowerCase(), tagType=input.getAttribute("type");
			if(tagType!=null){tagType=tagType.toLowerCase();}
			var needTestCheck=(tagName=="input"&&(tagType=="radio"||tagType=="checkbox"));
			return needTestCheck?this.testChecked(input, 1):input.value.length>0;
		};
		//测试必选(ruleObj:规则对象{minCheckedNum:最少选中的数量})
		this.testChecked=function(input, ruleObj){
			var chkedArray=this.getCheckedElements(input);
			var minCheckedNum=ruleObj["minCheckedNum"], maxCheckedNum=ruleObj["maxCheckedNum"];
			if(minCheckedNum!=undefined && minCheckedNum!=null){
				if(chkedArray==null||chkedArray.length<minCheckedNum){
					return false;
				}
			}
			if(maxCheckedNum!=undefined && maxCheckedNum!=null){
				if(chkedArray!=null && chkedArray.length>maxCheckedNum){
					return false;
				}
			}
			return true;
		};
		//测试长度(ruleObj:规则对象{minLength:最小长度, maxLength:最大长度})
		this.testLength=function(input, ruleObj){
			var len=input.value.length, minL=ruleObj["minLength"], maxL=ruleObj["maxLength"];
			if(minL!=undefined){
				if(minL>len){return false;}
			}
			if(maxL!=undefined){
				if(maxL<len){return false;}
			}
			return true;
		};
		//测试数字(ruleObj:规则对象{minValue:最小值, maxValue:最大值})
		this.testInt=function(input, ruleObj){
			if(input.value.length>0){
				//测试是否是数字
				if(/^\-?[1-9]{1}[0-9]{0,}$/.test(input.value)||input.value=="0"){
					;
				}else{
					return false;
				}
				var num=parseInt(input.value);
				if(isNaN(num)){
					return false;
				}
				var minv=ruleObj["minValue"], maxv=ruleObj["maxValue"];
				if(minv!=undefined){
					if(num<minv){return false;}
				}
				if(maxv!=undefined){
					if(num>maxv){return false;}
				}
			}
			return true;
		};
		//测试浮点数(ruleObj:规则对象{scale:精度(小数位数), minValue:最小值, maxValue:最大值})
		this.testFloat=function(input, ruleObj){
			if(input.value.length>0){
				var num=parseFloat(input.value);
				if(/^[1-9]{1}[\d]{0,}(\.[\d]{1,})?$/.test(input.value)==false ||isNaN(num)){//转数字失败
					return false;
				}
				var val=input.value, scale=ruleObj["scale"], minv=ruleObj["minValue"], maxv=ruleObj["maxValue"];
				if(scale!=undefined && val.indexOf(".")!=-1){
					if(scale<(val.length-val.indexOf(".")-1)){return false;}
				}
				if(minv!=undefined){
					if(minv>num){return false;}
				}
				if(maxv!=undefined){
					if(maxv<num){return false;}
				}
			}
			return true;
		};
		//测试固定电话
		this.testCNTel=function(input, ruleObj){
			if(input.value.length>0){
				return (/^(0[1-9]{1}[\d]{1,2}\-)?[1-9]{1}{\d}{6,7}(\-[\d]{1,})?$/.test(input.value));
			}
			return true;
		};
		//测试手机号码
		this.testCNMobile=function(input, ruleObj){
			if(input.value.length>0){
				return (/^1[34578]{1}[\d]{9}$/.test(input.value));
			}
			return true;
		};
		/**
		 * 测试日期
		 * 当前时间可以大于等于beginDate, 必须小于endDate
		 * */
		this.testDate=function(input, ruleObj){
			if(input.value.length>0){
				var format = ruleObj["format"];
				if(format==undefined || format==null || format===""){
					format = this.getProp([this.globeSetting], "dateTimeFormat", "string");
				}
				var curDate = this.parseDate(input.value, format);
				if(curDate==null){//日期(时间)格式非法
					return false;
				}
				var beginDate=ruleObj["beginDate"], endDate=ruleObj["endDate"];
				if(beginDate!=undefined && beginDate!=null){
					if(curDate.getTime()<beginDate.getTime()){
						return false;//当前时间晚于等于开始时间
					}
				}
				if(endDate!=undefined && endDate!=null){
					if(curDate.getTime()>=endDate.getTime()){
						return false;//当前时间早于结束时间
					}
				}
			}
			return true;
		};
		this.testDomain=function(input, ruleObj){
			if(input.value.length>0){
				var domain=input.value;
				//域名校验
			    var dl = [];//域名数组
			    var lp = 0;
			    for(var pp=domain.indexOf('.');;pp=domain.indexOf('.', lp)){
			        if(pp==lp){//不允许连续的点||点在第一位
			            return false;
			        }
			        if(pp==-1){
			            dl.push(domain.substring(lp));
			            break;
			        }
			        dl.push(domain.substring(lp, pp));
			        lp = pp+1;
			    }
			    if(dl.length<2){
			        return false;
			    }
			    //此处倒序循环
			    for(var i=0;i<dl.length;i++){
			        //待校验域名
			        var cd = dl[dl.length-i-1];
			        if(cd.length<1){
			            return false;//不允许连续的点
			        }
			        if(i==0){//顶级域名
			            for(var j=0;j<cd.length;j++){//顶级域名必须由纯字母组成
			              var cc=cd.charCodeAt(j);
			              if((cc>64&&cc<91) || (cc>96&&cc<123)){
			                  continue;
			              }else{
			                  return false;
			              }
			            }
			        }else{//if(i==1)//主域名(数字,字母,短横线,短横线不能在首尾出现,且不能连续出现)
			            if(cd.length>63){//域名不能超过63个字符
			                return false;
			            }
			            lc = 0 ;
			            for(var j=0;j<cd.length;j++){
			                var cc = cd.charCodeAt(j);
			                if(j==0 || j==(cd.length-1)){//首尾
			                    if(cc==45){//45:'-'
			                        return false;
			                    }
			                }
			                if(cc==lc && cc==45){//不能出现连续'-'
			                    return false;
			                }
			                if( (cc>47&&cc<58) || (cc>64&&cc<91) || (cc>96&&cc<123) || cc==45){//45:'-'
			                    ;
			                }else{
			                    return false;
			                }
			                lc = cc;
			            }
			        }//else{}//二级(自定义)域名
			    }
			}
			return true;
		};
		/**
		 * 测试Email
		 * 名字中可以包含(英文半角)字母、数字、下划线、点、短横线, 其中首尾字符只能是字母,数字,下划线
		 * 域名中可以包含(英文半角)字母、数字、短横线, 其中首尾字符不能出现短横线 
		 * */
		this.testEmail=function(input, ruleObj){
			if(input.value.length>0){
				var val=input.value;
				if(this.trim(val)<1){
			        return false;
			    }
			    var atp=val.indexOf('@');// '@' 所在的位置
			    if(atp<1 || atp==(val.length-1)){// '@' 不能在第一位,也不能在最后一位
			        return false;
			    }
			    //分割名称和域名
			    var name=val.substring(0, atp), domain=val.substring(atp+1);
			    if(name.length<1 || domain.length<1 ){
			        return false;
			    }
			    //名称中允许使用的特殊字符
			    var arra = [46,45,95];//{46:'.', 45:'-', 95:'_', 36:'$'}
			    //不允许出现在首尾的字符, 不允许连续使用的字符
			    var arrf = [46,45];//{46:'.', 45:'-', 95:'_', 36:'$'}
			    //名称检验规则
			    //1. 允许使用(英文半角)字母/数字/下划线/点/短横线
			    //2. 点/下划线不允许连续使用,且不能出现在首尾
			    var lc=0;//上一个char
			    for(var i=0;i<name.length;i++){
			        var cc = name.charCodeAt(i);//cc为ascii值
			        if(i==0 || i==(name.length-1) ){//第一位或最后一位
			            for(var j=0;j<arrf.length;j++){
			                if(cc==arrf[j]){
			                    return false;
			                }
			            }
			        }
			        if(lc==cc){//有两个连续的相同的char
			            for(var j=0;j<arrf.length;j++){//判断是否是不允许连续使用的字符
			                if(cc==arrf[j]){
			                    return false;
			                }
			            }
			        }
			        if( (cc>47&&cc<58) || (cc>64&&cc<91) || (cc>96&&cc<123) ){
			            ;//数字字母
			        }else{
			            var tb = false;
			            for(var j=0;j<arra.length;j++){//当前字符是否允许使用的字符
			                if(arra[j]==cc){//
			                    tb=true;
			                }
			            }
			            if(tb==false){//含有不允许使用的字符
			                return false;
			            }
			        }
			        lc=cc;
			    }
			    //域名校验
			    var dl = [];//域名数组
			    var lp = 0;
			    for(var pp=domain.indexOf('.');;pp=domain.indexOf('.', lp)){
			        if(pp==lp){//不允许连续的点||点在第一位
			            return false;
			        }
			        if(pp==-1){
			            dl.push(domain.substring(lp));
			            break;
			        }
			        dl.push(domain.substring(lp, pp));
			        lp = pp+1;
			    }
			    if(dl.length<2){
			        return false;
			    }
			    //此处倒序循环
			    for(var i=0;i<dl.length;i++){
			        //待校验域名
			        var cd = dl[dl.length-i-1];
			        if(cd.length<1){
			            return false;//不允许连续的点
			        }
			        if(i==0){//顶级域名
			            for(var j=0;j<cd.length;j++){//顶级域名必须由纯字母组成
			              var cc=cd.charCodeAt(j);
			              if((cc>64&&cc<91) || (cc>96&&cc<123)){
			                  continue;
			              }else{
			                  return false;
			              }
			            }
			        }else{//if(i==1)//主域名(数字,字母,短横线,短横线不能在首尾出现,且不能连续出现)
			            if(cd.length>63){//域名不能超过63个字符
			                return false;
			            }
			            lc = 0 ;
			            for(var j=0;j<cd.length;j++){
			                var cc = cd.charCodeAt(j);
			                if(j==0 || j==(cd.length-1)){//首尾
			                    if(cc==45){//45:'-'
			                        return false;
			                    }
			                }
			                if(cc==lc && cc==45){//不能出现连续'-'
			                    return false;
			                }
			                if( (cc>47&&cc<58) || (cc>64&&cc<91) || (cc>96&&cc<123) || cc==45){//45:'-'
			                    ;
			                }else{
			                    return false;
			                }
			                lc = cc;
			            }
			        }//else{}//二级(自定义)域名
			    }
			}
			return true;
		};
		//测试正则(ruleObj:规则对象{regexp:正则表达式})
		this.testRegexp=function(input, ruleObj){
			if(input.value.length>0){
				var re=ruleObj["regexp"];
				return ((typeof re).toLowerCase()=="string" ? new RegExp(re) : re).test(input.value);
			}
			return true;
		};
		//测试function(ruleObj:规则对象{function:待执行匿名函数体})
		this.testFunction=function(input, ruleObj){
			//if(input.value.length>0){
				var func=ruleObj["function"];
				if((typeof func).toLowerCase()=="function"){
					var returnVal=func.call(input, this);
					return returnVal==undefined||returnVal==null ? true : (returnVal==true||returnVal==false?returnVal:true);
				}
			//}
			return true;
		};
		//测试ajax(ruleObj:规则对象{url:请求地址, sync:请求是否是同步[默认Y], successHandler:返回成功处理函数, errorHandler:返回错误处理函数})
		this.testAjax=function(input, ruleObj){
			var xhr;
			try{
				xhr = window.ActiveXObject ? new window.ActiveXObject( "Microsoft.XMLHTTP" ) : new window.XMLHttpRequest();
			}catch(e){
				xhr = null;
			}
			if (!xhr) {
				alert("您的浏览器不支持ajax!");
				return false;
			};
			var sync = ruleObj["sync"];
			xhr.open(ruleObj["method"],ruleObj["url"],sync=="Y");
			xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
			if(sync!="Y"){
				xhr.onreadystatechange=function(){
					if(xhr.readyState==4 && xhr.status==200){
						ruleObj["successHandler"].call(this, {url:ruleObj["url"], status:xhr.status, responseText:xhr.responseText});
					}else{
						ruleObj["errorHandler"].call(this, {url:ruleObj["url"], status:xhr.status, responseText:xhr.responseText});
					}
				}
			}
			xhr.send(input.name+"="+urlComponentEncode(input.value));
			if(sync=="Y"){
				return true;
			}else{
				if(xhr.readyState==4 && xhr.status==200){
					return ruleObj["successHandler"].call(this, {url:ruleObj["url"], status:xhr.status, responseText:xhr.responseText});
				}else{
					return ruleObj["errorHandler"].call(this, {url:ruleObj["url"], status:xhr.status, responseText:xhr.responseText});
				}
			}
			//return true;
		};
		
		/**
		 * 获取已勾选(checkbox)或已选中(radio)input 对象
		 * @param input 必须是表单对象(input, select, textarea)
		 * */
		this.getCheckedElements=function(input){
			var elements=input.form.elements[input.name];
			if(elements!=null){
				if(("length" in elements)==false){
					elements=[elements];
				}
				var checkedArray=[];
				for(var i=0;i<elements.length;i++){
					if(elements[i].checked==true){
						checkedArray.push(elements[i]);
					}
				}
				return checkedArray;
			}
			return null;
		};

		//处理规则对象
		this.parseRule=function(ruleObj){
			//设置当前规则校验状态(如果没有设置则设置为 9 : 正常)
			this.setProp(ruleObj, "state", 9);
			var rule = XYV["ruleMap"][ruleObj["cmd"]];
			if(rule==null){
				rule = XYV["ruleMap"][XYV["ruleCmdAlias"][ruleObj["cmd"]]];
			}
			if(rule==null){
				return null;
			}
			return rule.parse.call(this, ruleObj);
		};

		//表单项事件绑定函数
		this.addEvent=function(input, eventName, callFunc){
			if(input.addEventListener){
				input.addEventListener(eventName, callFunc, false);
			}else if(input.attachEvent){
				input.attachEvent("on"+eventName, callFunc);
			}else{
				input["on"+eventName]=callFunc;
			}
		};
		//表单项事件解绑函数
		this.removeEvent=function(input, eventName, callFunc){
			if(input.removeEventListener){
				input.removeEventListener(eventName, callFunc, false);
			}else if(input.detachEvent){
				input.detachEvent("on"+eventName, callFunc);
			}else{
				input["on"+eventName]=null;
			}
		};

		/**
		 * 获取指定input对象(如果是radio或者checkbox 则返回最后一个对象)
		 * @param inputName 表单项名称
		 * @return 返回找到的input对象
		 * */
		this.getElement=function(inputName){
			if(inputName==null||inputName==""){
				return null;
			}
			var input = this.form.elements[inputName];
			//判断是否是Collection, 如果是,则返回最后一个对象
			if(input!=null && !input.getAttribute && ("length" in input) ){
				input = input[input.length-1];
			}
			return input;
		};

		this.inputXyvCfgKey="xyv_cfg_key";

		/**
		 * 检查表单对象是否可以添加校验
		 **/
		this.checkInput=function(element){
			var flag=false;
			if(element!=null){
				flag=true;
				if("disabled" in element && element.disabled==true){
					flag=false;
				}
			}
			return flag;
		};

		/**
		 * 添加验证规则(ruleObj:规则对象{name:表单项名称*必填, cmd:规则名称*必填, ...})
		 * {
		 *		*name:表单域名称
		 *		*cmd:验证指令
		 *		message:提示内容
		 *		marginLeft:距左像素数, 当提示消息在input右侧显示时有效
		 *		marginTop:距上像素数, 当提示消息在input下侧显示时有效
		 *		marginBottom:距下像素数, 当提示消息在input上侧显示时有效
		 * }
		 * */
		this.add=function(ruleObj){
			ruleObj = this.parseRule(ruleObj);
			if(ruleObj==null){return this;}
			//this.setProp(ruleObj, "verifyOnFormSubmit", this.globeSetting["verifyOnFormSubmit"]);//提交表单时是否验证当前规则
			var input=this.getElement(ruleObj["name"]);
			if(this.checkInput(input)){
				var xyvCK=input[this.inputXyvCfgKey];
				if(xyvCK==undefined||xyvCK==null){//第一次添加校验规则
					xyvCK={"ruleArray":[], "bindEventNameMap":{}};
				}
				//触发事件
				var triggerEventName=this.getProp([ruleObj, this.globeSetting], "triggerEvent", "string");
				if(this.isEmpty(triggerEventName)==false && xyvCK["bindEventNameMap"][triggerEventName]!='Y'){
					this.addEvent(input, triggerEventName, function(event){
						var input=event.currentTarget||event.srcElement;
						var xyv = input.form.xyv;
						var xyvCK=input[xyv.inputXyvCfgKey];
						if(xyvCK!=null && xyv.isArray(xyvCK["ruleArray"])){
							xyv.validateInput(input, event.type);
						}
					});
					xyvCK["bindEventNameMap"][triggerEventName]='Y';
				}
				if(xyvCK["ruleArray"]==undefined || this.isArray(xyvCK["ruleArray"])==false){xyvCK["ruleArray"]=[];}
				xyvCK["ruleArray"].push(ruleObj);
				if(this.isEmpty(ruleObj["autoTrim"])==false){
					xyvCK["autoTrim"]=ruleObj["autoTrim"];
				}
				input[this.inputXyvCfgKey]=xyvCK;
				//显示Info提示
				this.addEvent(input, "focus", function(event){
					var input=event.currentTarget||event.srcElement;
					var xyv = input.form.xyv;
					if(xyv.globeSetting["hideTipOnFocus"]==="Y"){
						xyv.hideTip({"name":input["name"], "type":"error"});
						//显示提示信息
						var xyvCK=input[xyv.inputXyvCfgKey];
						if(xyv.getProp([xyvCK, xyv.globeSetting], "displayInfoTip", "string")==="Y"){
							var tipInfo = xyvCK==undefined||xyvCK==null?null:xyvCK["tipInfo"];
							if(tipInfo!=null){
								xyv.showTip(tipInfo);
							}
						}
					}
				});
				//if(ruleObj["type"]==="info" && this.getProp([ruleObj,this.globeSetting], "displayInfoTip", "string")==="Y"){
					//this.showTip(ruleObj);
				//}
			}
			return this;
		};
		//暂停(启用)验证规则(ruleObj:规则对象{name:表单项名称*必填, state:是否暂停*必填{P:停用, O:启用}, cmd:规则名称*非必填})
		this.pause=function(ruleObj){
			if(ruleObj==undefined || ruleObj==null || ruleObj["name"]==undefined || ruleObj["name"]==null
					||ruleObj["state"]==undefined || ruleObj["state"]==null || ruleObj["state"]==""){
				return;
			}
			var state=ruleObj["state"];
			if(state=="O" || state=="o"){
				state = 9;
			}else if(state=="P"||state=="p"){
				state=4;
			}else{
				return;
			}
			var input=this.form.elements[ruleObj["name"]];
			if(input!=null){
				var xyvCK=input[this.inputXyvCfgKey];
				if(xyvCK!=undefined && this.isArray(xyvCK["ruleArray"])==true){
					var ra=xyvCK["ruleArray"], nra=[], rule;
					for(var i=0;i<ra.length;i++){
						if(ruleObj["cmd"]==undefined||ruleObj["cmd"]==null){
							ra[i]["state"]=state;
							nra.push(ra[i]);
						}else{
							if(ruleObj["cmd"]==ra[i]["cmd"]){
								ra[i]["state"]=state;
							}
							nra.push(ra[i]);
						}
					}
					ra.splice(0, ra.length);//删除全部数组元素
					xyvCK["ruleArray"]=nra;
					input[this.inputXyvCfgKey]=xyvCK;
				}
			}
			return this;
		};
		//移除验证规则(ruleObj:规则对象{name:表单项名称*必填, cmd:规则名称*非必填})
		this.remove=function(ruleObj){
			if(ruleObj==undefined || ruleObj==null || ruleObj["name"]==undefined || ruleObj["name"]==null){
				return;
			}
			var input=this.form.elements[ruleObj["name"]];
			if(input!=null){
				var ra=input[this.inputRuleArrayKey];
				if(ra!=undefined && this.isArray(ra)==true){
					var cmd=ruleObj["cmd"], nra=[];
					if(cmd==undefined||cmd==null||cmd==""){
						;
					}else{
						for(var i=0;i<ra.length;i++){
							if(cmd!=ra[i]["cmd"]){
								nra.push(ra[i]);
							}
						}
					}
					ra.splice(0, ra.length);//删除全部数组元素
					input[this.inputRuleArrayKey]=nra;
				}
			}
			return this;
		};
		//打印规则列表
		this.trace=function(inputName){
			var inputArr;
			if(inputName==undefined||inputName==null){
				inputArr=this.form.elements;
			}else{
				inputArr=this.form.elements[inputName];
			}
			if(inputArr==null){
				return '';
			}
			if("length" in inputArr){
				;
			}else{
				inputArr=[inputArr];
			}
			var str='';
			for(var i=0;i<inputArr.length;i++){
				var xyvCK = inputArr[i][this.inputXyvCfgKey];
				if(xyvCK!=null){
					str += inputArr[i].name+"<br/>";
					var ra=xyvCK["ruleArray"];
					if(this.isArray(ra)){
						str += "&nbsp;&nbsp;[<br/>";
						for(var j=0;j<ra.length;j++){
							var ta=[];
							str += "&nbsp;&nbsp;&nbsp;&nbsp;{";
							for(var k in ra[j]){
								ta.push(k+":"+ra[j][k]);//
							}
							str += ta.join("&nbsp;,&nbsp;")+"}<br/>";
						}
						str += "&nbsp;&nbsp;]<br/><br/><br/>";
					}
				}
			}
			return str;
		};

		/** 构建验证提示div id */
		this.buildTipDivId=function(inputName){
			if(this.isEmpty(inputName)){
				return null;
			}
			return "xyv_"+this.version+"_yt_"+this.form["id"]+"_xr_"+inputName;
		};
		/**
		 * 添加样式
		 * @param node 待添加样式dom对象
		 * @param className 样式名称
		 * */
		this.addClass=function(node, className){
			if(node==undefined||node==null){
				return;
			}
			if(className==undefined || className==null
					||(typeof className).toLowerCase()!="string"){
				return;
			}
			var curClass = node["className"];
			if(curClass!=undefined && curClass!=null){
				if((typeof curClass).toLowerCase()!="string"){
					node["className"] = className;
				}else{
					if(curClass.indexOf(className)==-1){
						node["className"] = curClass + " "+className;
					}
				}
			}else{
				node["className"] = className;
			}
		};
		/**
		 * 移除样式
		 * @param node 待移除样式dom对象
		 * @param className 样式名称
		 * */
		this.removeClass=function(node, className){
			if(node==undefined||node==null){
				return;
			}
			if(className==undefined || className==null
					||(typeof className).toLowerCase()!="string"){
				return;
			}
			var curClass = node["className"];
			if(curClass!=undefined && curClass!=null){
				if((typeof curClass).toLowerCase()==="string"){
					node["className"] = curClass.replace(className, "").replace("  ", " ");
				}
			}
		};
		/**
		 * 计算表单项坐标(绝对坐标)
		 * */
		this.calcCoordinate=function(input){
			var cdt={x:0,y:0}, tmpElement=input;
			do{
				cdt.x += tmpElement.offsetLeft;
				cdt.y += tmpElement.offsetTop;
				tmpElement = tmpElement.offsetParent;
				if(!tmpElement){break;}
			}while(tmpElement.tagName.toUpperCase()!="BODY" && tmpElement.tagName.toUpperCase()!="HTML");
			return cdt;
		};
		/**
		 * 显示信息(参数中带*的均为必填参数)
		 * @param messageObjet 消息对象{
		 * 		*name:表单项名称
		 * 		*message:提示消息内容
		 * 		*type:消息类型(correct,error,info)
		 * 		*location:提示消息位置(top,right,bottom) 当前仅实现右侧显示
		 * 		fixedStyle:修正样式
		 *		marginLeft:距左像素数, 当提示消息在input右侧显示时有效
		 *		marginTop:距上像素数, 当提示消息在input下侧显示时有效
		 *		marginBottom:距下像素数, 当提示消息在input上侧显示时有效
		 * }
		 * */
		this.showTip=function(messageObjet){
			//参数校验
			if(messageObjet==undefined||messageObjet==null){return;}
			if(this.checkType(messageObjet["name"], "string")==false){return;}
			if(this.checkType(messageObjet["message"], "string")==false){return;}
			if(this.checkType(messageObjet["type"], "string", ["correct","error","info"])==false){return;}
			if(this.checkType(messageObjet["location"], "string", ["top","right","bottom"])==false){return;}
			var input=this.getElement(messageObjet["name"]);
			if(input==null){return;}
			var tipDivId=this.buildTipDivId(messageObjet["name"]);
			messageObjet["tipDivId"]=tipDivId;
			messageObjet["xyv"]=this;
			var tipDiv=document.getElementById(tipDivId);
			if(tipDiv!=null){
				tipDiv.parentNode.removeChild(tipDiv);
			}
			tipDiv = document.createElement("div");
			tipDiv["id"]=tipDivId;
			var styleObject=this.clone(this.globeSetting["sharedStyle"]);//样式属性
			var soTmp=null;//临时变量
			var tcnArray=this.globeSetting["tipClassNameArray"];//提示DIV样式名称数组
			var tcn=null;//提示DIV样式名称
			if(this.isArray(tcnArray)==false || tcnArray.length<3){
				tcnArray=[null,null,null];
			}
			switch(messageObjet["type"]){
			case "correct":
				tcn=tcnArray[0];
				soTmp = this.globeSetting["correctStyle"];
				break;
			case "error":
				tcn=tcnArray[1];
				soTmp = this.globeSetting["errorStyle"];
				break;
			case "info":
				tcn=tcnArray[2];
				soTmp = this.globeSetting["infoStyle"];
				break;
			}
			if(tcn!=null){
				tipDiv["class"]=tcn;
			}
			//合并类别样式
			if(soTmp!=undefined && soTmp!=null){
				for(var k in soTmp){
					styleObject[k]=soTmp[k];
				}
			}
			soTmp = messageObjet["fixedStyle"];
			//合并修正类别样式
			if(soTmp!=undefined && soTmp!=null){
				for(var k in soTmp){
					styleObject[k]=soTmp[k];
				}
			}
			var spArray=[];
			for(var k in styleObject){
				spArray.push(k+":"+styleObject[k]);
			}
			tipDiv.style.cssText=spArray.join(";");
			tipDiv.innerHTML=messageObjet["message"];
			var top=0, left=0;
			var cdt=this.calcCoordinate(input);//当前对象坐标
			tipDiv.style.display="block";
			document.getElementsByTagName("BODY")[0].appendChild(tipDiv);
			switch(messageObjet["location"]){
			case "top"://上侧
				top=cdt.y-tipDiv.offsetHeight-5;
				left=(cdt.x+5);
				//修正位置
				/*var _h_c=Math.abs(tipDiv.offsetHeight-49);
				if(_h_c>10 && (tipDiv.offsetTop-_h_c>0)){
					top=(tipDiv.offsetTop-_h_c);
				}*/
				break;
			case "bottom"://底侧
				top=cdt.y+input.offsetHeight+3;
				left=(cdt.x+input.offsetWidth*0.382);
				break;
			case "right"://右侧
			default:
				//
				var marginLeft = parseInt(messageObjet["marginLeft"]);
				if(isNaN(marginLeft)){
					marginLeft=parseInt(this.globeSetting["tipMarginLeft"]);
					if(isNaN(marginLeft)){marginLeft=0;}
				}
				top=cdt.y+(input.offsetHeight-tipDiv.offsetHeight)/2;
				left=cdt.x+input.offsetWidth+marginLeft;
				break;
			}
			tipDiv.style.top=top+"px";
			tipDiv.style.left=left+"px";
			//将消息对象存入队列
			this.tipObjectMap[messageObjet["name"]]=messageObjet;
			/*var existFlag = false;
			for(var i=0;i<this.tipQueue.length;i++){
				var tmp=this.tipQueue[i];
				if(tmp["name"]===input["name"]){
					existFlag=true;
				}
			}
			if(existFlag==false){
				this.tipQueue.push(messageObjet);
			}*/
		};

		/**
		 * 隐藏信息提示(带'*'为必填参数)
		 * @param messageObjet 隐藏提示参数
		 * {
		 * 		*name:表单项名称
		 * 		 type:消息类型(correct,error,info,any) 默认为error
		 * 				一般只关闭相同类型的提示信息
		 * 				如果为any 则直接隐藏当前提示
		 * }
		 * */
		this.hideTip=function(messageObjet){
			//参数校验
			//if(messageObjet==undefined||messageObjet==null){return;}
			//if(this.checkType(messageObjet["name"], "string")==false){return;}
			//if(this.checkType(messageObjet["type"], "string", ["correct","error","info","any"])==false){return;}
			var name=messageObjet==undefined||messageObjet==null?null:messageObjet["name"];
			var type=messageObjet==undefined||messageObjet==null?null:messageObjet["type"];
			var newTom={}, deadArray=[];
			//将消息对象移出队列
			for(var k in this.tipObjectMap){
				var val=this.tipObjectMap[k];
				if(name==undefined||name==null||name===""){//移除全部表单消息
					if(type==undefined || type==null || type===""){//移除全部类型消息
						deadArray.push(val);
					}else if(type===val["type"]){
						deadArray.push(val);
					}else{
						newTom[k]=val;
					}
				}else{//移除指定表单项消息
					if(name===val["name"]){
						if(type==undefined || type==null || type===""){//移除全部类型消息
							deadArray.push(val);
						}else if(type===val["type"]){
							deadArray.push(val);
						}else{
							newTom[k]=val;
						}
					}else{
						newTom[k]=val;
					}
				}
			}
			this.tipObjectMap=newTom;
			for(var i=0;i<deadArray.length;i++){
				var tipDiv=document.getElementById(this.buildTipDivId(deadArray[i]["name"]));
				if(tipDiv!=null){
					//tipDiv.style.display="none";
					tipDiv.parentNode.removeChild(tipDiv);
				}
			}
			//验证不通过时,input添加的样式
			var veiClassName = this.getProp([this.globeSetting], "validateErrorInputClassName", "string");
			//移除验证不通过input样式
			if(veiClassName!=undefined && veiClassName!=null){
				for(var i=0;i<deadArray.length;i++){
					this.removeClass(this.form.elements[deadArray[i]["name"]], veiClassName);
				}
			}
		};

		/**
		 * 验证单个表单项
		 * 警告:禁止除validateInput之外的函数调用
		 * @param 待验证表单项
		 * */
		this.validateRules=function(input, triggerType){
			var xyvCK=input[this.inputXyvCfgKey];
			if(triggerType==undefined||triggerType==null||triggerType==""){
				triggerType="submit";//默认为表单提交触发
			}
			if(xyvCK==undefined||xyvCK==null){
				return true;
			}
			if(this.getProp([xyvCK, this.globeSetting], "autoTrim", 'string')=="Y"){
				input.value=input.value.replace(/(^\s*)|(\s*$)/g,"");
			}
			var ruleArray=xyvCK["ruleArray"];
			if(this.isArray(ruleArray)){
				for(var i=0;i<ruleArray.length;i++){
					var ruleObj=ruleArray[i];
					if(ruleObj["state"]==undefined || ruleObj["state"]!=9){
						continue;
					}
					if(triggerType==="submit"){
						if(this.getProp([ruleObj, this.globeSetting], "verifyOnFormSubmit", "string")!="Y"){
							continue;
						}
					}else{
						if(this.getProp([ruleObj, this.globeSetting], "triggerEvent", "string")!=triggerType){//触发条件不对
							continue;
						}
					}
					var messageObjet={}, testFlag=true, cmd=ruleArray[i]["cmd"];
					var rule = XYV["ruleMap"][cmd];
					if(rule==null){
						rule = XYV["ruleMap"][XYV["ruleCmdAlias"][cmd]];
					}
					if(rule!=null){
						testFlag = rule.validate.call(this, input, ruleObj);
					}
					if(testFlag==false){//同一个表单项 按顺序验证,实行短路验证 即 任意一个验证不通过则返回验证不通过结果
						//显示验证不通过提示信息
						var mo={"name":input["name"], "type":"error", "message":ruleObj["message"],"location":ruleObj["location"]};
						this.setProp(mo, "location", this.globeSetting["tipLocation"]);
						if(ruleObj["fixedStyle"]!=undefined){
							mo["fixedStyle"]=ruleObj["fixedStyle"];
						}
						this.showTip(mo);
						return false;
					}
				}
			}
			return true;
		};
		/**
		 * 验证单个表单项(开放其他函数调用)
		 * @param 待验证表单项
		 * */
		this.validateInput=function(input, triggerType){
			var vf = true;
			if(input.name.length>0 && input[this.inputXyvCfgKey]!=null){
				vf = this.validateRules(input, triggerType);
				var xyvCK=input[this.inputXyvCfgKey];
				//验证不通过时,input添加的样式
				var veiClassName = this.getProp([this.globeSetting], "validateErrorInputClassName", "string");
				if(vf==true){
					//隐藏错误提示信息
					this.hideTip({"name":input["name"], "type":"error"});
					
					if(this.getProp([this.globeSetting], "displayCorrectTip", "string")==="Y"){//显示成功提示信息
						if(xyvCK!=undefined && xyvCK!=null && this.isArray(xyvCK["ruleArray"]) && xyvCK["ruleArray"].length>0){
							var mo={"name":input["name"], "type":"correct"};
							this.setProp(mo, "location", this.globeSetting["tipLocation"]);
							//var cmsg=ruleObj["correctMessage"];//成功消息
							//mo["message"]=cmsg==undefined||cmsg==null?"ok":cmsg;
							mo["message"]="√";
							this.showTip(mo);
						}
					}else{
						//显示Info提示
						var tipInfo = xyvCK==undefined||xyvCK==null?null:xyvCK["tipInfo"];
						if(tipInfo!=null && this.getProp([xyvCK, this.globeSetting], "displayInfoTip", "string")==="Y"){
							this.showTip(tipInfo);
						}
					}
					//移除验证不通过input样式
					if(veiClassName!=null){
						this.removeClass(input, veiClassName);
					}
				}else{
					//增加验证不通过input样式
					if(veiClassName!=null){
						this.addClass(input, veiClassName)
					}
				}
			}
			return vf;
		};
		/**
		 * 验证整个表单
		 * 返回 true或者false(true:提交表单, false:不提交表单)
		 * */
		this.validateAllInput=function(){
			if((this.constructor===XYV)==false){
				return this["xyv"].validateAllInput.call(this["xyv"]);
			}
			this.param={obj:{},qs:""};
			//获取全部表单项
			var allInputs=this.form.elements;
			if(!("length" in allInputs)){
				allInputs=[allInputs];//如果不是数组则转换成数组
			}
			var finalFlag=true;//最终返回结果变量
			//循环校验全部表单项
			for(var i=0;i<allInputs.length;i++){
				var curFlag=this.validateInput.call(this,allInputs[i],"submit");
				if(curFlag==true){//校验通过,将选项值记入
					var curValue=this.param.obj[allInputs[i].name];
					if(curValue==null || curValue==undefined){
						var inputs=this.form.elements[allInputs[i].name];//同名参数 checkbox,radio..
						if(inputs==null){
							continue;
						}
						if("length" in inputs && !inputs.getAttribute){
							var arr=[];
							for(var j=0;j<inputs.length;j++){
								switch(inputs[j]["type"]){
								case "text":
								case "hidden":
									arr.push(inputs[j].value);
									break;
								default:
									if("checked" in inputs[j]){
										if(inputs[j].checked==true){
											arr.push(inputs[j].value);
										}
									}else{
										arr.push(inputs[j].value);
									}
									break;
								}
							}
							this.param.obj[allInputs[i].name]=arr;
						}else{
							this.param.obj[allInputs[i].name]=allInputs[i].value;
						}
					}/*else{
						if(this.isArray(curValue)){
							curValue.push(allInputs[i].value);
						}else{
							var arr=[];
							arr.push(curValue);
							arr.push(allInputs[i].value);
							this.param.obj[allInputs[i].name]=arr;
						}
					}*/
					continue;
				}else{//校验不通过
					if(finalFlag==true){//第一个验证不通过
						//是否自动滚动到第一个错误input处
						if(this.globeSetting["scrollFirstErrorInput"]==="Y"){
							var cdt = this.calcCoordinate(allInputs[i]);
							var x=cdt.x-30, y=cdt.y-40;
							window.scrollTo(x<0?0:x, y<0?0:y);
						}
						//是否自动将焦点转移至第一个错误input
						if(this.globeSetting["focusFirstErrorInput"]==="Y"){
							allInputs[i].focus();
						}
					}
					finalFlag=false;
					if(this.globeSetting["shortVerify"]=="Y"){//当前是短路校验
						break;
					}else{//当前不是短路校验
						continue;
					}
				}
			}
			if(finalFlag==true){
				//调用提交前函数
				finalFlag = this.globeSetting["beforeSubmit"].call(this);
				if(finalFlag==undefined||finalFlag==null){
					finalFlag=true;
				}else if(finalFlag=="Y"){
					finalFlag=true;
				}else if(finalFlag=="N"||finalFlag==0){
					finalFlag=false;
				}else{
					finalFlag=true;
				}
				//调用提交后函数
				if(finalFlag==true){
					this.globeSetting["afterSubmit"].call(this);
				}
			}
			return finalFlag;
		};

		/**
		 * 设置默认提示信息(如果重复设置,则以最后一次设置为主)
		 * @param mo 消息对象
		 * {
		 *		*name:表单域名称
		 *		*opt:操作类型(A:添加,R:移除)
		 *		*message:消息提示内容(当opt为'A'时,不能为空)
		 *		marginLeft:距左像素数, 当提示消息在input右侧显示时有效
		 *		marginTop:距上像素数, 当提示消息在input下侧显示时有效
		 *		marginBottom:距下像素数, 当提示消息在input上侧显示时有效
		 * }
		 * */
		this.setInfoTip=function(mo){
			if(mo==undefined || mo==null || mo["name"]==undefined || mo["name"]==null){
				return;
			}
			var opt=mo["opt"];
			mo["opt"]=undefined;
			if(opt==undefined||opt==null){
				opt='A';
			}
			if(opt==="A"){
				if(mo["message"]==undefined||mo["message"]==null||mo["message"]===""){
					return;
				}
			}
			var input=this.form.elements[mo["name"]];
			if(input==null){
				return;
			}
			var xyvCK=input[this.inputXyvCfgKey];
			if(xyvCK==undefined||xyvCK==null){//第一次添加校验规则
				xyvCK={"ruleArray":[], "bindEventNameMap":{}};
			}
			if(opt==="A"){
				mo["type"]="info";
				this.setProp(mo, "location", this.globeSetting["tipLocation"]);
				xyvCK["tipInfo"]=mo;
				//显示Info提示
				if(mo!=null && this.getProp([xyvCK, this.globeSetting], "displayInfoTip", "string")==="Y"){
					this.showTip(mo);
				}
			}else{
				xyvCK["tipInfo"]=undefined;
			}
			input[this.inputXyvCfgKey]=xyvCK;
		};

		/**
		 * 显示全部提示信息
		 * */
		this.showInfoTip=function(){
			//获取全部表单项
			var allInputs=this.form.elements;
			if("length" in allInputs){
				;
			}else{
				allInputs=[allInputs];//如果不是数组则转换成数组
			}
			//循环全部表单项
			for(var i=0;i<allInputs.length;i++){
				var xyvCK=allInputs[i][this.inputXyvCfgKey];
				var mo = xyvCK==undefined||xyvCK==null?null:xyvCK["tipInfo"];
				if(mo!=null){
					this.showTip(mo);
				}
			}
		};

		this.form.onsubmit=null;
		this.form.onsubmit=this.validateAllInput;
	}
	XYV["ruleMap"]={};
	XYV["ruleCmdAlias"]={};
	XYV.extend=function(param){
		var type=param["type"];
		type = (typeof type).toLowerCase()=="string"?type:"rule";
		switch(type){
		case "function":
			if((typeof param["name"]).toLowerCase()==="string" && ((typeof param["function"]).toLowerCase()==="function") ){
				if( (param["name"] in this)==false ){
					XYV.prototype[param["name"]]=param["function"];
				}
			}
			break;
		case "rule":
			var rule=param["rule"]||null;
			if(rule!=null){
				//必须要有以下属性 cmd(string), parse(function), validate(function)
				//可选属性 alias(string)
				if((typeof rule["parse"]).toLowerCase()==="function" &&
					(typeof rule["validate"]).toLowerCase()==="function" &&
					(typeof rule["cmd"]).toLowerCase()==="string" ){
					XYV["ruleMap"][rule["cmd"]]=rule;
					if(rule["alias"]!=undefined && (typeof rule["alias"]).toLowerCase()==="string" && rule["alias"].length>0){
						var tmpArr = rule["alias"].split(",");
						for(var i=0;i<tmpArr.length;i++){
							if(tmpArr[i].length>0 && XYV["ruleCmdAlias"][tmpArr[i]]==undefined){
								XYV["ruleCmdAlias"][tmpArr[i]]=rule["cmd"];
							}
						}
					}
				}
			}
			break;
		}
	};
	/** XXXXXXXXXXXXXX */
	/*XYV.extend({"type":"function", "name":"test", "function":function(){
			alert(this.toString());
		}
	});*/
	/** XXXXXXXXXXXXXX */
	/*XYV.extend({"type":"rule", "rule":{
		"cmd":"test",
		"alias":"tester,test001",
		//如果处理通过在返回处理过的'ruleObj' 否则返回null
		"parse":function(ruleObj){
			
		},
		//返回true或者false
		"validate":function(){
			
		}
	}});*/
	/** 必填校验(input:待验证表单项) */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"req",
		"alias":"required",
		"parse":function(ruleObj){
			if(this.isEmpty(this.trim(ruleObj["message"]))){
				ruleObj["message"]=ruleObj["name"]+" 必须填写(选择)!";
			}
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testRequired(input, ruleObj);
		}
	}});
	/** 测试必选(ruleObj:规则对象{minCheckedNum:最少选中的数量}) */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"checked",
		"alias":null,
		"parse":function(ruleObj){
			//最少选中数量, 最多选中数量
			var minChkNum=ruleObj["minCheckedNum"], maxChkNum = ruleObj["maxCheckedNum"];
			if(minChkNum==undefined||minChkNum==null||isNaN(parseInt(minChkNum))||parseInt(minChkNum)<1){
				minChkNum = null;
			}else{
				minChkNum = parseInt(minChkNum);
			}
			if(maxChkNum==undefined||maxChkNum==null||isNaN(parseInt(maxChkNum))||parseInt(maxChkNum)<1){
				maxChkNum = null;
			}else{
				maxChkNum = parseInt(maxChkNum);
			}
			if(minChkNum==null && maxChkNum==null){
				return null;
			}
			if(this.isEmpty(this.trim(ruleObj["message"]))){
				var _message=ruleObj["name"]+" 请选择";
				if(minChkNum!=null){
					_message += " 至少 "+minChkNum+"项";
				}
				if(maxChkNum!=null){
					_message += " 至多 "+maxChkNum+"项";
				}
				ruleObj["message"]=_message;
			}
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testChecked(input, ruleObj);
		}
	}});
	/** 测试长度(ruleObj:规则对象{minLength:最小长度, maxLength:最大长度}) */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"len",
		"alias":"length",
		"parse":function(ruleObj){
			var minL=ruleObj["minLength"], maxL=ruleObj["maxLength"];
			if(this.isEmpty(minL)==false){
				if(isNaN(parseInt(minL)) || parseInt(minL)<1){
					ruleObj["minLength"] = minL = undefined;
				}else{
					ruleObj["minLength"] = minL = parseInt(minL);
				}
			}
			if(this.isEmpty(maxL)==false){
				if(isNaN(parseInt(maxL)) || parseInt(maxL)<1){
					ruleObj["maxLength"] = maxL = undefined;
				}else{
					ruleObj["maxLength"] = maxL = parseInt(maxL);
				}
			}//两个值均为空 次规则无效
			if(minL==undefined && maxL==undefined){
				return null;
			}
			if(minL!=undefined && maxL!=undefined){
				if(minL>maxL){//如果有需要交换最大最小值
					var tmp=minL;
					ruleObj["minLength"] = minL = maxL;
					ruleObj["maxLength"] = maxL = tmp;
				}
			}
			if(this.isEmpty(this.trim(ruleObj["message"]))){
				var _message = ruleObj["name"]+" 内容长度";
				if(minL!=undefined){_message+=" 最少 "+minL+" 个字";}
				if(maxL!=undefined){_message+=" 最多 "+maxL+" 个字";}
				ruleObj["message"]=_message;
			}
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testLength(input, ruleObj);
		}
	}});
	/** 测试数字(ruleObj:规则对象{minValue:最小值, maxValue:最大值}) */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"int",
		"alias":"integer",
		"parse":function(ruleObj){
			var minV=ruleObj["minValue"], maxV=ruleObj["maxValue"];
			if(this.isEmpty(minV)==false){
				ruleObj["minValue"] = minV = (isNaN(parseInt(minV)) ? undefined : parseInt(minV));
			}
			if(this.isEmpty(maxV)==false){
				ruleObj["maxValue"] = maxV = (isNaN(parseInt(maxV)) ? undefined : parseInt(maxV));
			}
			//如果有需要交换最大最小值
			if(minV!=undefined && maxV!=undefined){
				if(minV>maxV){
					var tmp=minV;
					ruleObj["minValue"] = minV = maxV;
					ruleObj["maxValue"] = maxV = tmp;
				}
			}
			if(this.isEmpty(this.trim(ruleObj["message"]))){
				var _message = ruleObj["name"]+" 值必须是一个整数数字";
				if(minV!=undefined){_message+=" 最小 "+minV;}
				if(maxV!=undefined){_message+=" 最大 "+maxV;}
				ruleObj["message"]=_message;
			}
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testInt(input, ruleObj);
		}
	}});
	/** 测试浮点数(ruleObj:规则对象{scale:精度(小数位数), minValue:最小值, maxValue:最大值}) */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"float",
		"alias":"decimal",
		"parse":function(ruleObj){
			var scale=ruleObj["scale"], minv=ruleObj["minValue"], maxv=ruleObj["maxValue"];
			if(scale==undefined || scale==null || isNaN(parseInt(scale))){
				return null;
			}
			if(parseInt(scale)<1){
				ruleObj["scale"] = scale = 1;
			}
			if(this.isEmpty(minv)==false){
				ruleObj["minValue"] = minv = (isNaN(parseFloat(minv)) ? undefined : parseFloat(minv));
			}
			if(this.isEmpty(maxv)==false){
				ruleObj["maxValue"] = maxv = (isNaN(parseFloat(maxv)) ? undefined : parseFloat(maxv));
			}
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testFloat(input, ruleObj);
		}
	}});
	/** 测试中国固定电话 */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"tel",
		"alias":"CN-tel",
		"parse":function(ruleObj){
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testCNTel(input, ruleObj);
		}
	}});
	/** 测试中国手机号码 */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"mobile",
		"alias":"CN-mobile",
		"parse":function(ruleObj){
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testCNMobile(input, ruleObj);
		}
	}});
	/**
	 * 测试日期
	 * 当前时间可以大于等于beginDate, 必须小于endDate
	 * */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"date",
		"alias":null,
		"parse":function(ruleObj){
			var beginDate=ruleObj["beginDate"], endDate=ruleObj["endDate"], format=ruleObj["dateFormat"];
			if(format==null||format.length<1){format=this.globeSetting["dateFormat"];}
			ruleObj["format"]=format;
			if(this.isEmpty(beginDate)==false){
				beginDate = this.parseDate(beginDate, format);
				ruleObj["beginDate"] = beginDate==null ? undefined : beginDate;
			}
			if(this.isEmpty(endDate)==false){
				endDate = this.parseDate(endDate, format);
				ruleObj["endDate"] = endDate==null ? undefined : endDate;
			}
			//如果有需要交换最大最小值
			if(beginDate!=null && endDate!=null){
				if(beginDate.getTime()>endDate.getTime()){
					var tmp=beginDate;
					ruleObj["beginDate"] = minV = beginDate;
					ruleObj["endDate"] = endDate = tmp;
				}
			}
			if(this.isEmpty(this.trim(ruleObj["message"]))){
				var _message = ruleObj["name"]+" 值必须是一个整数数字";
				if(beginDate!=null){_message+=" 早于 "+beginDate;}
				if(endDate!=null){_message+=" 晚于 "+endDate;}
				ruleObj["message"]=_message;
			}
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testDate(input, ruleObj);
		}
	}});
	/**
	 * 测试Email
	 * 名字中可以包含(英文半角)字母、数字、下划线、点、短横线, 其中首尾字符只能是字母,数字,下划线
	 * 域名中可以包含(英文半角)字母、数字、短横线, 其中首尾字符不能出现短横线 
	 * */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"email",
		"alias":null,
		"parse":function(ruleObj){
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testEmail(input, ruleObj);
		}
	}});
	/** 测试正则(ruleObj:规则对象{regexp:正则表达式}) */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"regexp",
		"alias":null,
		"parse":function(ruleObj){
			var regexp=ruleObj["regexp"];
			if(regexp==null||regexp==undefined||regexp==""){
				return null;
			}
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testRegexp(input, ruleObj);
		}
	}});
	/** 测试正则(ruleObj:规则对象{regexp:正则表达式}) */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"domain",
		"alias":null,
		"parse":function(ruleObj){
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testDomain(input, ruleObj);
		}
	}});
	/** 测试function(ruleObj:规则对象{function:待执行匿名函数体}) */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"function",
		"alias":null,
		"parse":function(ruleObj){
			var func=ruleObj["function"];
			if(func==null || func==undefined || (typeof func).toLowerCase()!="function"){
				return null;
			}
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testFunction(input, ruleObj);
		}
	}});
	/** 测试(同步的)ajax(ruleObj:规则对象{url:请求地址, successHandler:返回成功处理函数, errorHandler:返回错误处理函数}) */
	XYV.extend({"type":"rule", "rule":{
		"cmd":"ajax",
		"alias":null,
		"parse":function(ruleObj){
			var url=ruleObj["url"], method=ruleObj["method"], sync=ruleObj["sync"], successHandler=ruleObj["successHandler"], errorHandler=ruleObj["errorHandler"];
			if(this.isEmpty(url)){
				return null;
			}
			if(this.isEmpty(method)){
				ruleObj["method"] = method = "POST";
			}else{
				ruleObj["method"] = method = method.toUpperCase();
			}
			if(method!="POST" && method!="GET"){
				ruleObj["method"] = method = "POST";
			}
			if(sync==null||sync==undefined){
				ruleObj["sync"] = sync = "Y";
			}
			if(successHandler==null||(typeof successHandler).toLowerCase()!="function"){
				//xyv:XYV对象, resp:响应结果对象{url:当前请求地址, status:当前请求返回的状态代码, responseText:当前请求返回的内容}
				ruleObj["successHandler"] = successHandler = function(xyv, resp){
					return true;
				}
			}
			if(errorHandler==null || (typeof errorHandler).toLowerCase()!="function"){
				//xyv:XYV对象, resp:响应结果对象{url:当前请求地址, status:当前请求返回的状态代码, responseText:当前请求返回的内容}
				ruleObj["errorHandler"] = errorHandler=function(xyv, resp){
					alert("请求发生异常:\nurl:"+resp["url"]+"\nstatus:"+resp["status"]+"\nresponseText:"+responseText);
					return false;
				}
			}
			return ruleObj;
		},
		"validate":function(input, ruleObj){
			return this.testAjax(input, ruleObj);
		}
	}});
	window.XYV=XYV;
})();
