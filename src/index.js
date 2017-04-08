(function(){
	
	// j-Eli File Uploader
	// created wed Jul 20 2016
	// Requires jQuery

	'use strict';

	jEli
	.jModule('jeli.file.uploader',{})
	.jFactory('jUploadService',['$http',jUploadServiceFn])
	.jElement('jFileUpload',['jUploadService',jFileUploadFn]);


	function jUploadServiceFn($http){

		var protos= function(){},
			jQl = jEli.dom,
			_events = {},
			defualtConfig  = {
					container: 				"",		
					button: 				"",
					width:					100,
					height:					100,
					loading:				null,
					support: 				"image/jpg,image/png,image/bmp,image/jpeg,image/gif",			
					callback:				function(){}
			};


		protos.prototype.bindJquery = function(){
			if(window.jQuery){
				jQuery.fn.jFileUploader = function(){
					return jQl(this).live({
					  click:function()
					  {
					  		var jUService = new protos();
					  		jUService.selectFile(this);
					  }
					});
				}

				jQl("[aria-role=upload]").jFileUploader();
			}

			return this;
		};

		//extend defaultOptions
		protos.prototype.setOptions = function(name,value){
			defualtConfig[name] = value;

			return this;
		};

		protos.prototype.options = ({
				url: 					"",
				multipart:				false,
				singleFileUploads:		true,
				forceIframeTransport:	false,
				limitMultiFileUploads:	undefined,
				type:					"POST",
				paramName:				null,
				fileInput:				undefined,
				processData:			false,
				contentType:			false,
				cache:					false,
				dataType:				'json',
				idx:					{},
				fData:					function(form){	return form.serializeArray(); },
				multipart:				true
		});
		//build Button
		protos.prototype.buildConfiguration = function(settings){
			this.uOptions = jEli.$extend({},defualtConfig,settings);
			if(settings.dragArea){
				this.uOptions.dragArea = jQl("#"+settings.dragArea);
			}

			//set File to started
			this.isFileStarted = true;

			return this;
		};

		protos.prototype.selectFile = function(input){

			if(input.getAttribute('isfileuploadstarted')){ return }

			var ele = jQl(input),
				me = this,
				fileType=ele.data("attr"),
			    fileInput=jQl("<input />");
			this.buildConfiguration(ele.data("settings"));
			ele.attr('isfileuploadstarted',true);

            fileInput
            .attr(fileType)
            .on("change",function(e){
                me._iSpecialOptions(fileInput);
	            me._r(e);
	             if(e.target.files)
	             {
	             	ele
	             	.hide(1,function(){ me.uOptions.button = ele;})
	             	.removeAttr('isfileuploadstarted');
	             }
            });

            //check when file was cancled
            //bind event to body when dialog is close
            document.body.onfocus = function(){
            	//remove event binder
            	setTimeout(function(){
            		input.removeAttribute('isfileuploadstarted');
            		document.body.onfocus = null;
            	},100);
            };

	        fileInput[0].click();
		};

		//set Protos
		protos.prototype._FData = function(options)
		 {
		 	var formData;
		 	 if (typeof options.formData === 'function') {
	                return options.fData(options.form);
	            }
	            if (jEli.$isArray(options.formData)) {
	                return options.fData;
	            }
	            if (jEli.$isObject(options.formData)){
	                formData = [];
		               jEli.forEach(options.formData, function (name, value) {
	                    formData.push({name: name, value: value});
	                });

	                return formData;
	            }
	            return [];
		 };

		 protos.prototype._pn = function(options)
		 {
		 	var fileInput = jQl(options.fileInput);
		 	var pn = options.paramName;
		 	if(!pn)
		 	{
		 		pn = [];
		 		fileInput.each(function(){
		 			var input = jQl(this),
		 				name = input.prop('name') || 'files[]',
		 				ele = (input.prop('files') || [1]).length;
		 			while(ele)
		 			{
		 				pn.push(name);
		 				ele -=1;
		 			}
		 		});
		 		if(!pn.length)
		 		{
		 			pn = [fileInput.prop('name') || 'file[]'];
		 		}
			}else if(!jEli.$isArray(pn))
			{
				pn = [pn];
			}
			return pn;	
		 };

		 protos.prototype.sl = jQl.support.slice && function()
		 {
		 	var slice = this.slice || this.webkitSlice || this.mozSlice;
	            return slice.apply(this, arguments);
		 };

		 protos.prototype._isXHRFileUpload = function(options)
		 {
		 	return (!options.forceIframeTransport && jQl.support.xhrFileUpload);
		 };

		 protos.prototype._getDeferredState =  function (deferred) 
		 {
	        if (deferred.state) {
	            return deferred.state();
	        }
	        if (deferred.isResolved()) {
	            return 'resolved';
	        }
	        if (deferred.isRejected()) {
	            return 'rejected';
	        }
	        return 'pending';
	     };

	     protos.prototype._iProgressObject =  function(obj)
		 {
		 	var progress = {
	                loaded: 0,
	                total: 0,
	                bitrate: 0
	            };
	            if (obj._progress) {
	                jQl.extend(obj._progress, progress);
	            } else {
	                obj._progress = progress;
	            }
		 };

		 protos.prototype._iResponseObject = function(obj)
		 {
		 	var prop;
	            if (obj._response) {
	                for (prop in obj._response) {
	                    if (obj._response.hasOwnProperty(prop)) {
	                        delete obj._response[prop];
	                    }
	                }
	            } else {
	                obj._response = {};
	            }
		 };

		 protos.prototype._addConvenienceMethods = function(e,data)
		 {
		 	var me = this,
                getPromise = function (data) {
                    return jQl.Deferred().resolveWith(me, [data]).promise();
                };
	            data.process = function (resolveFunc, rejectFunc) {
	                if (resolveFunc || rejectFunc) {
	                    data._processQueue = this._processQueue =
	                        (this._processQueue || getPromise(this))
	                            .pipe(resolveFunc, rejectFunc);
	                }
	                return this._processQueue || getPromise(this);
	            };
	            data.submit = function () {
	                if (this.state() !== 'pending') {
	                    data.jqXHR = this.jqXHR =	me._onSend(e, this);
	                }
	                return this.jqXHR;
	            };
	            data.abort = function () {
	                if (this.jqXHR) {
	                    return this.jqXHR.abort();
	                }
	            };
	            data.state = function () {
	                if (this.jqXHR) {
	                    return me._getDeferredState(this.jqXHR);
	                }
	                if (this._processQueue) {
	                    return me._getDeferredState(this._processQueue);
	                }
	            };
	            data.progress = function () {
	                return this._progress;
	            };
	            data.response = function () {
	                return this._response;
	            };

		 };

		 protos.prototype._onAdd =  function(e,data)
		 {
		 	var me = this,
		 		result = true,
		 		opts = jQl.extend({},this.options,data),
		 		limit = opts.limitMultiFileUploads,
	            paramName = this._pn(opts),
	            paramNameSet,
	            paramNameSlice,
	            fileSet,
	            i;
	            
	        if(!(opts.singleFileUploads || limit))
	        {
	        	fileSet = [data.files];
	        	paramNameSet = [paramName];
	        }else if(!opts.singleFileUpload && limit ){
	        	fileSet = [];
	            paramNameSet = [];
	            for (i = 0; i < data.files.length; i += limit) {
	                fileSet.push(data.files.slice(i, i + limit));
	                paramNameSlice = paramName.slice(i, i + limit);
	                if (!paramNameSlice.length) {
	                    paramNameSlice = paramName;
	                }
	                paramNameSet.push(paramNameSlice);
	            }
	        } else {
	            paramNameSet = paramName;
	        }
				data.originalFiles = data.files;
	            jQl.each(fileSet || data.files, function (index, element) {
	                var newData = jQl.extend({}, data);
	                newData.files = fileSet ? element : [element];
	                newData.paramName = paramNameSet[index];
	                newData.formData = me.uOptions.formData;
	                me._iResponseObject(newData);
	                me._iProgressObject(newData);
	                me._addConvenienceMethods(e, newData);
	                result = me._add(e, newData);
	                
	                return result;
	            });
	            return result;
		 };

		 protos.prototype._add = function(e,data)
		 {
		 	var opts = this.options,
		 		files = data.files,
		 		me = this;
		 	data.process(function(){	}).always(function(){ data.submit(files);	});
		 };

		protos.prototype._onTemplate = function(e,data)
		 {
		 	var	options = jQl.extend({},this.uOptions,data),
		 		files = options.files,
		 		me = this;
		 		
		 	if(files.length)
		 	{
		 		jQl.each(files,function(i,file)
		 		{
		 			me._p([file]);
		 		});
		 	}
		 	return false;
		 };

		 protos.prototype._p = function(data)
		 {
		 	var self = this;
			if(data.length>0)
			{
				var html="",
					uId="";
				for(var i=0;i<data.length;i++)
				{
					uId = this._q(data[i].name);
					if(typeof data[i]!=undefined)
					{
						if(this._v(data[i].type)<=0){ return; }

						 var uCover = 	jQl("<div />").addClass("_duCon")
				 						.attr("rel",uId)
				 						.css({"width":self.uOptions.width+"px","height":self.uOptions.height+"px"}),
						 uLoad = 	jQl("<div />").addClass("_lnd"),
						 uPrg = 	jQl("<div />").addClass("_pCN")
			 						.css("width",Math.ceil(self.uOptions.width - 5)+"px")
			 						.append('<div class="_pCG"><div class="_isPG" class="0%"></div></div>');
			 			if(self.uOptions.loading){
			 				uLoad.html('<img src="'+self.uOptions.loading+'" />');
			 			}

			 			uCover.append(uLoad,uPrg);
					}

					self.uOptions.dragArea.append(uCover).show();
				}
			}
		};

		protos.prototype._rfInput = function(input)
		{
			var iclone = input.clone(true);
			jQl("<form></form>").append(iclone)[0].reset();
			input.after(iclone).detach();
			jQl.cleanData(input.unbind('remove'));
			this.options.fileInput = this.options.fileInput.map(function(i, el)
			{
				if(el === input[0]){
				return iclone[0];
				}
				return el;
			});
			
			if (input[0] === this.options.fileInput[0]) {
	                this.options.fileInput = inputClone;
	            }

		};

		protos.prototype._iSpecialOptions =function(ele)
		{
			var options = this.options;
			if (options.fileInput === undefined) {
	            options.fileInput = ele;
	        } else if (!(options.fileInput instanceof jQl)) {
	            options.fileInput = jQl(options.fileInput);
	        }
		};

		protos.prototype._fsInput = function(fileInput)
		{
			fileInput = jQl(fileInput);
			var files,values;
			files = jQl.makeArray(fileInput.prop('files'));
			if(!files.length)
			{
				values = fileInput.prop('value')
				if(!values)
				{
					return jQl.Deferred.resolve([]).promise();
				}
			files = [{name: value.replace(/^.*\\/, '')}];
			}else if(files[0].name === "undefined" && files[0].filename)
			{
				jQl.each(files, function(index,file)
				{
					file.name = file.fileName;
					file.size = file.fileSize
				});
			}

			return jQl.Deferred().resolve(files).promise();
		};

		protos.prototype._fInput = function(fileInput)
		{
			if (!(fileInput instanceof jQl) || fileInput.length === 1) {
	                return this._fsInput(fileInput);
	            }
	            return jQl.when.apply(
	                jQl,
	                jQl.map(fileInput, this._fsInput)
	            ).pipe(function () {
	                return Array.prototype.concat.apply(
	                    [],
	                    arguments
	                );
	            });
		};

		protos.prototype._r = function(e)
		{
		  if(jQl.support.fileReader)
		  {
		  	var me = this,
		  		data = ({
		  					fileInput : jQl(e.target),
		  					form : jQl(e.target.form)
		  		});
		  	this._fInput(data.fileInput).always(function(files){
		  		data.files = files;
		  		me._rfInput(data.fileInput);
		  		me._onTemplate(e,data);
				me._onAdd(e,data);
			});
		  }else{console.log("Failed file reading");}
		};

		protos.prototype._v = function(format)
		{
	    	var arr=this.uOptions.support.split(",");
	    	   return arr.indexOf(format);
		};

		protos.prototype._d = function(e)
	   	{
	       e.stopPropagation();
	       e.preventDefault();
	       this._p(e.dataTransfer.files);
	       this.uOptions.all.push(e.dataTransfer.files);
	   	};

	   	protos.prototype._ld = function(idx,exp,c)
		{		var	
		  			_ftempHolder,
		  			me = this;
		  	
		  	if(this._i('Object',idx) || jEli.$isArray(idx))
		  	{
		  		jQl.each(idx,function(i,n)
		  		{
		  			_ftempHolder  = jQl("._duCon[rel='"+n+"']");
		  			ido(i);	
		  		});
		  		
		  	}else
		  	{
		  		_ftempHolder = jQl("._duCon[rel='"+idx+"']");
		  		ido();	
		  	}
		  	
		  	function ido(inx)
		  	{	
		  		if( exp )
		  		{
		    		_ftempHolder.find("._lnd").show();

			  	}else
			  	{
			  		_ftempHolder.find("._isPG").animate({"width":"100%"},250);
					_ftempHolder.find("._pCN").hide('fast');
					_ftempHolder.find("._lnd").hide();
					if(jEli.$isFunction(c))
					{
						c(_ftempHolder);
					}else
					{
						if(me._i('Object',c))
						{
							var data = c.data,
								link = c.link,
								res = jQl("<div arial-img='"+idx[inx]+"'></div>")
									.append(jQl("<img>")
									.prop('src',link[inx])
									.prop('height',me.uOptions.width))
									.append(jQl("<input />")
									.prop('type','hidden')
									.prop('name','link_img[]')
									.val(data[inx]))
									.append(jQl("<a></a>")
									.prop('href','#')
									.attr({'ajaxify':'/upload.php','data-settings':'{"imgDel":"'+data[inx]+'","idx":"'+idx[inx]+'","alCN":"'+me.uOptions.formData.album_id+'","setFolder":"'+me.uOptions.formData.setFolder+'"}'})
									.bind('click',function(){me.__removeImage(this,_ftempHolder);})
									.html("<span>x</span>"))
									.addClass("_imC");
							_ftempHolder.append( res ).animate({'opacity':'100'},250);
							
							if(c.enhance)
							{
								me.triggerEvent('file.upload.enhance',c.enhance);
							}
						}
					}
			  	}
			};
	   };

	   protos.prototype.reset = function(_ftemp){
	   		var me =  this;
	   		_ftemp
			.hide(1,function()
			{ 
				jQl(this).remove(); 
				me.uOptions.button.show();
			});

			return this;
	   };


	   protos.prototype.__removeImage = function(data,_ftemp)
	   {
	   		var settings = jQl(data).data("settings"),
	   			options = {},
	   			me = this;
	   			options.url = jQl(data).attr("ajaxify");
	   			options.type = "POST";
	   			options.dataType = "html";
	   			options.data = settings;
	   			_ftemp.animate({'opacity':'30'},250).find("._lnd").show();
	   		if(settings)
	   		{
	   			jQl
	   			.ajax(options)
	   			.done(function(r)
	   			{ 
	   				if(r)
	   				{ 
	   					me.reset(_ftemp); 
	   				} 
	   			}).fail(function(){ });
	   		}
	   };

		protos.prototype._ua = function(options)
		{
			var file = options.files[0],
				idx = options.idx['idx'];
		   if(typeof file != undefined && this._v(file.type)>0)
		   {
			   var	me = this,
			   		jqXHR;
		   		this._ld(idx,1);
				jqXHR = jQl.ajax(options);
				jqXHR.done(function(r){ me._dn( r || {} );  });
				jqXHR.fail(function(){ });
	    	}else{	console.log("Invalid file format - "+file.name);}
	    	
	    	return jqXHR;
	    };

	    protos.prototype._uif = function(options)
	    {  	
    		var	counter = 0,
    			iframe,
		   		form,
		   		me = this;
			   		
			this._ld( options.idx,1 );   		
	    	form = jQl("<form></form>");
		   		iframe = jQl('<iframe name="'+counter+'" src="javascript:false">');	   	
		    iframe.bind("load",function()
		    {
	   			iframe
	   			.unbind('load')
	   			.bind('load',function()
	   			{
   				  	var res,ponse = {};
   				  	try	{
   				  		res = iframe.contents();
   				  	if (!res.length || !res[0].firstChild) {
                            throw new Error();
                        }
                    } catch (e) {
                        res = undefined;
                    }
	                me._dn( a.ajaxSettings.converters['text '+d.dataType]( res.text() )	);
		                   	               
		            window.setTimeout(function(){ form.remove(); },0);
		        });

				form.prop("method",me.uOptions.type)
					.prop("action",me.uOptions.url)
					.prop("target",iframe.prop("name"))
					.append(options.data)
					.prop('enctype', 'multipart/form-data')
	                .prop('encoding', 'multipart/form-data')
	                .addClass('hidden_elem');
	            
				form.submit();
	            options.fileInput.each(function (index, input) 
	            {
                    var clone = jQl(fileInputClones[index]);
                    jQl(input).prop('name', clone.prop('name'));
                    clone.replaceWith(input);
                });
					
			});
			
			form.append(iframe).appendTo("div#page_frame_holder",document);		
	    };


	    protos.prototype._dn = function(obj)
	    {
	    	var me = this;
	    	 switch(obj.confirm)
	        {
	        	case"suc":
	        		me._ld( obj.ids,0,{data:obj.data,link:obj.imageLink,enhance:obj.enhance} ); 
	        	break;
	        	case"fai":
	        		me._ld( obj.ids,0,function(_ftempHolder){ me.reset(_ftempHolder).triggerEvent('file.upload.error',obj); } );
	        	break;
	        }  	
	    };

	    protos.prototype._onSend = function(e,data)
	    {  
			var options = this._f(data); 
			var me = this,
				res;
			if(this._isXHRFileUpload(options))
	    	{	
	    		res = this._ua(options);
	    	}else{
	    		this._uif(options);
	    	}
	    	return res;
	    };


	    protos.prototype._idx = function(options)
	    {
	    	var me = this,
	    		idx;
	    		if(this._isXHRFileUpload(options))
	    		{
		    		options.idx['idx'] = this._q(options.files[0].name);
		    		options.idx['name'] = options.files[0].name;
		    		options.formData['idx[]'] = options.idx['idx'];
		    		idx = options.idx['idx'];
		    		options.context = jQl("._duCon[rel='"+idx+"']");
		    	}else
		    	{
		    		jQl.each(options.files, function(inx, val)
		    		{
		    			options.idx.push({inx:me._q(options.files[inx].name)});
		    		});
		    	}
	    };

	    protos.prototype._i =  function (type, obj) 
	    {
	       return Object.prototype.toString.call(obj) === '[object ' + type + ']';
	    };


	    protos.prototype._iFrameSettings = function(options)
	    {
	    	var formData = jQl("<div></div>");
	    	if(this.uOptions.formData)
	    	{
	         	jQl.each(this.uOptions.formData,function(index,val)
	         	{
	         		jQl("<input type='hidden' />")
	         		.prop('name',index)
	         		.val(val)
	         		.appendTo(data);
	         	});
	         }
	         	if(this._i('Object',options.idx))
	         	{
	         		jQl.each(options.idx, function(inx,val)
	         		{
	         		   	jQl("<input type='hidden' />")
	         			.prop('name','idx[]')
	         			.val(val)
	         			.appendTo(data);
	         		});
	         			
	         	}
	         	if(options.fileInput && options.fileInput.length && options.type === "POST")
	         	{
	         		fileInputclone = options.fileInput.clone();
	         		options.fileInput.after(function (index) {
                        return fileInputClones[index];
                    });
	                 fileInputclone.appendTo(data);
	         	}
		
	    };

	    protos.prototype._onProgress = function(e,data)
	    {
	    	if(e.lengthComputable)
	    	{
	    		   var	done = e.position || e.loaded, 
	    		   		total = e.totalSize || e.total,
	    		   		pc = (Math.floor(done/total*1000)/10) + '%';
				  if(data.context)
				  {
				  	data.context.find("._isPG").animate({"width":pc},250);
				  }
	        
	    	}
	    };

	    protos.prototype._iEventListener = function(data)
	    {
	    	var me = this,
	            xhr = data.xhr ? data.xhr() : jQl.ajaxSettings.xhr();

	        if (xhr.upload) 
	        {
	            jQl(xhr.upload)
	            .bind('progress', function (e) 
	            {
	                var oe = e.originalEvent;
	                e.lengthComputable = oe.lengthComputable;
	                e.loaded = oe.loaded;
	                e.total = oe.total;
	                me._onProgress(e, data);
	            });

	            data.xhr = function () {
	                return xhr;
	            };
	        }
	    };

	    protos.prototype._iXHRData =  function(options)
	    {
	    	var me = this,
	    		formData,
	    		file = options.files[0],
	    		multipart = options.multipart || !jQl.support.xhrFileUpload;
	    	options.headers = options.headers || {};
	    	var paramName = options.paramName[0];
	    	
	    	if(!multipart)
	    	{
	    		options.contentType = file.type;
	    		options.data = options.blob || file;
	    	}else if(jQl.support.isFormData)
	    	{
	    		if(this._i('FormData',options.fData))
	    		{
	    			formData = options.fData;
	    		}else
	    		{
	    			formData = new FormData();
	    			jQl.each(this._FData(options), function(index,field)
	    			{
	    				formData.append(field.name,field.value);
	    			});
	    		}
	    		if(options.blob)
	    		{
	    			formData.append(paramName,options.blob,file.name);
	    		}else
	    		{
	    			jQl.each(options.files,	function( index, file)
	    			{
	    				if(me._i('File',file) || me._i('Blob', file))
	    				{
	    					formData.append( paramName, file, file.name);
	    				}
	    			});
	    		}
	    		
	    		options.data = formData;
	    	}
	    };

	    protos.prototype._iDataSettings =  function(options)
	    {
	    	if(this._isXHRFileUpload(options))
	    	{
	    		if(!options.data)
	    		{
	    			this._iXHRData(options);
	    		}
	    			this._iEventListener(options);
	    	}else
	    	{
	    		this._iFrameSettings(options);
	    	}
	    };

	  	protos.prototype._iFormSettings = function(options)
	  	{
	  		if(!options.form || !options.form.length)
	  		{
	  			options.form = jQl(this.options.fileInput.prop('form'));
	  			
	  			if(!options.form.length)
	  			{
	  				options.form = jQl(this.options.fileInput.prop('form'));
	  			}
	  		}
	  			options.paramName = this._pn(options);
	  			
	  			if(!options.url)
	  			{
	  				options.url = this.uOptions.formData.url || location.href;
	  			}
	  			options.type = (options.type || options.form.prop('method') || '');
	  			if (!options.formAcceptCharset) {
	                options.formAcceptCharset = options.form.attr('accept-charset');
	            }
	  	};


	    protos.prototype._f = function(data)
	    {
	    	var me = this,
	    		options = jQl.extend({},this.options,data);
	    	this._idx(options);
	    	this._iFormSettings(options);
	    	this._iDataSettings(options);
	       return options; 
	    };

	    protos.prototype._q =function(str){
	    	return str.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26)})
	    };

	    protos.prototype.triggerEvent = function(name,params){
	    	if(_events[name]){
	    		for(var i in _events[name]){
	    			_events[name][i].apply(_events[name][i],[params]);
	    		}
	    	}
	    };

	    protos.prototype.$on = function(name,fn){

	    	if(!_events[name]){
	    		_events[name] = [];
	    	}

	    	_events[name].push( fn );

	    	return this;
	    };


	    return protos;

	}


	//jFileUploadFn
	//jElement Functionality

	function jFileUploadFn(jUploadService){

		return ({
			$init : jFileUploadInitFn
		});

		function jFileUploadInitFn(ele,attr,model){
			var jUService = new jUploadService();
			ele.bind('click',function()
			{
				jUService.selectFile(ele[0]);
			});
		}
	}

})();