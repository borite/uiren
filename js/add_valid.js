var ItemStat = {
    name: false,
    phone: false,
    home: false,
    school: false,
    carnum: false,
    field: false,
    product: false
}

var jcrop_api;   //头像裁剪插件对象

$(document).ready(function () {

    $("#reg_inputs_area .right-txt span").hide();
    $("#uppic_wrap").appendTo("body");
    count_char_num($("#tb_CoachIntr"), $("#num_ind"), 500);
    $("#reg_inputs_area input.input-txt").on({
        focus: function () {
            var msgID = $(this).attr("id").replace("t", "l");
            $("#" + msgID).show();
        },
        blur: function () {
            var iptID = $(this).attr("id");
            var iptVal = $(this).val();
            checkForm(iptID, iptVal);
        },
        keyup: function () {
            var msgID = $(this).attr("id").replace("t", "l");
            $(this).removeClass("err-border");
            $("#" + msgID).removeClass("err-text");
            if ($(this).attr("id") == "tb_CoachPhone") {
                $("#" + msgID).text("该号码将作为登录凭证，请正确输入手机号码");
            }
        }
    });

    $('#head_wrap').click(function () {
        $("#up_head").click();
    })


    $('#up_head').change(function () {

        var size = 3 * 1024 * 1024;
        var file = this.files[0];
        var fileName = file.name;
        var fileSize = file.size;
        var fileType = fileName.substring(fileName.lastIndexOf('.'), fileName.length).toLowerCase();
        if (fileType != '.gif' && fileType != '.jpeg' && fileType != '.png' && fileType != '.jpg') {
            alert("上传失败，请上传jpg,png格式的图片");
            return;
        }
        if (fileSize > size) {
            alert("上传失败，请上传3MB以内的图片。");
            return;
        }

        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            $("#cropbox").attr("src", url);
            initJcrop();
            $.showPopLayer({
                target: "uppic_wrap",
                animate: false,
                onPop: function () {
                    if (jcrop_api != null) {
                        jcrop_api.setImage(url, function () {
                            var bb = this.getBounds();
                            var bWidth = Number(bb[0]) / 2;
                            var bHeight = Number(bb[1]) / 2;
                            this.setSelect([0, 0, bWidth, bHeight]);
                            var ss = this.getWidgetSize();
                            var aheight = (300 - Number(ss[1])) / 2 + "px";
                            $(".jcrop-holder").css({ "margin": aheight + " auto" });
                        })
                    }
                },
                onClose: function () {
                    $('#up_head').prop('value', '');
                }
            })
        }
    });




    $("#btn_save").click(function () {
        var imgSrc = document.getElementById("avatat_prev").toDataURL("image/png");
        console.log(imgSrc);
        document.getElementById("user_head").src = imgSrc;
        $("#img_filename").val(imgSrc);
        $.closePopLayer();

    });


    $("#pro_wrap input[type='checkbox']").click(function () {
        var vals = "";
        $("#pro_wrap input[type='checkbox']:checked").each(function () {
            vals += $(this).val() + ",";
        });
        $("#hf_products").val(vals);
        if (vals == "" || $("#hf_products").val() == "-1") {
            ItemStat.product = false;
        } else {
            ItemStat.product = true;
        }
    });


    $("#service_wrap input[type='checkbox']").click(function () {
        var vals = "";
        $("#service_wrap input[type='checkbox']:checked").each(function () {
            vals += $(this).val() + ",";
        });
        vals = vals.substr(0, vals.lastIndexOf(','));
        $("#hf_ext_service").val(vals);
    });


}); //ready end

//头像裁剪方法
function initJcrop() {
    $('#cropbox').Jcrop({
        onSelect: updateCoords,
        onChange: updateCoords,
        aspectRatio: 1,
        boxWidth: 400,
        boxHeight: 300,
        minSize: [150, 150]
    }, function () {
        jcrop_api = this;
        //图片实际尺寸
        var bb = this.getBounds();
        var bWidth = Number(bb[0]) / 2;
        var bHeight = Number(bb[1]) / 2;
        this.setSelect([0, 0, bWidth, bHeight]);
        var ss = this.getWidgetSize();
        var aheight = (300 - Number(ss[1])) / 2 + "px";
        $(".jcrop-holder").css({ "margin": aheight + " auto" });

    });
}
function updateCoords(c) {
    var img = document.getElementById("cropbox");
    var ctx = document.getElementById("avatat_prev").getContext("2d");

    //img,开始剪切的x,Y坐标宽高，放置图像的x,y坐标宽高。
    ctx.drawImage(img, c.x, c.y, c.w, c.h, 0, 0, 200, 200);
}



//**dataURL to blob**
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}






//表单检测

function checkForm(id, val) {
    var regExp;
    var msgID = id.replace("t", "l");
    switch (id) {
        case "tb_CoachName":
            regExp = /^[\u4E00-\u9FA5A-Za-z]{2,20}$/;
            if ($.trim(val) == "") {
                $("#" + msgID).hide();
                ItemStat.name = false;
            } else if (!regExp.test(val)) {
                ItemStat.name = false;
                showErrMsg(id)
            } else {
                $("#" + msgID).hide();
                ItemStat.name = true;
            }
            break;
        case "tb_CoachPhone":
            regExp = /^[1][34578][0-9]{9}$/;
            if ($.trim(val) == "") {
                $("#" + msgID).hide();
                ItemStat.phone = false;
            } else if (!regExp.test(val)) {
                ItemStat.phone = false;
                showErrMsg(id)
            } else {
                $("#" + msgID).text("正在检测号码...");

                $.ajax({
                    url: 'resources/check.ashx',
                    type: 'post',
                    data: { tbname: 'Asusi_Coach', colname: 'UserPhone', value: val },
                    success: function (data) {
                        if (data == "0") {
                            showErrMsg(id, "您的电话号码已注册，请检查");
                            ItemStat.phone = false;
                        } else {
                            $("#" + msgID).text("");
                            ItemStat.phone = true;
                        }
                    }
                })

            }
            break;
        case "tb_CoachHome":
            regExp = /^[\u4E00-\u9FA5A-Za-z]{2,20}$/;
            if ($.trim(val) == "") {
                $("#" + msgID).hide();
                ItemStat.home = false;
            } else if (!regExp.test(val)) {
                ItemStat.home = false;
                showErrMsg(id)
            } else {
                $("#" + msgID).hide();
                ItemStat.home = true;
            }
            break;
        case "tb_CoachSchool":
            regExp = /^[\u4E00-\u9FA5A-Za-z:\d+]{2,20}$/;
            if ($.trim(val) == "") {
                $("#" + msgID).hide();
                ItemStat.school = false;
            } else if (!regExp.test(val)) {
                ItemStat.school = false;
                showErrMsg(id)
            } else {
                $("#" + msgID).hide();
                ItemStat.school = true;
            }
            break;
        case "tb_CarNum":
            if ($.trim(val) == "") {
                $("#" + msgID).hide();
                ItemStat.carnum = false;
            } else if ($.trim(val).length == 0) {
                ItemStat.carnum = false;
                showErrMsg(id)
            } else {
                $("#" + msgID).hide();
                ItemStat.carnum = true;
            }
            break;
        case "tb_Field":
            regExp = /^[\u4E00-\u9FA5A-Za-z0-9;]{2,20}$/;
            if ($.trim(val) == "") {
                $("#" + msgID).hide();
                ItemStat.field = false;
            } else if (!regExp.test(val)) {
                ItemStat.field = false;
                showErrMsg(id)
            } else {
                $("#" + msgID).hide();
                ItemStat.field = true;
            }
            break;
        default:
            break;

    }
}


function showErrMsg(id, msg) {
    var msgID = id.replace("t", "l");
    $("#" + id).addClass("err-border");
    $("#" + msgID).addClass("err-text").show();
    if (msg != "") {
        $("#" + msgID).text(msg);
    }
}


//字数输入指示，参数仅接受Jquery对象
//ipt 　　　输入框对象
//ShowObj 　数字显示的对象
//maxNum 　 最大字数
function count_char_num(ipt, ShowObj, maxNum) {
    ipt.keyup(function () {
        var text = $(this).val();
        var counter = text.length;
        var leftNum = maxNum - counter;

        if (leftNum < 0) {
            text = text.substring(0, maxNum);
            $(this).val(text);
            ShowObj.text(maxNum + "/" + maxNum);
        } else {
            ShowObj.text(counter + "/" + maxNum);
        }
    })
}




function recheckForm() {
    var isOK = true;
    $.each(ItemStat, function (n, value) {
        switch (n) {
            case "name":
                if (value == false) {
                    showErrMsg("tb_CoachName");
                    isOK = false;
                }
                break;
            case "phone":
                if (value == false) {
                    showErrMsg("tb_CoachPhone");
                    isOK = false;
                }
                break;
            case "home":
                if (value == false) {
                    showErrMsg("tb_CoachHome");
                    isOK = false;
                }
                break;
            case "school":
                if (value == false) {
                    showErrMsg("tb_CoachSchool");
                    isOK = false;
                }
                break;
            case "carnum":
                if (value == false) {
                    showErrMsg("tb_CarNum");
                    isOK = false;
                }
                break;
            case "field":
                if (value == false) {
                    showErrMsg("tb_Field");
                    isOK = false;
                }
                break;
            case "product":
                if (value == false) {
                    $("#lb_for_product").addClass("err-text").show();
                    isOK = false;
                }
                //if ($("#hf_products").val() == "" || $("#hf_products").val()=="-1") {
                //    ItemStat.product = false;
                //    isOK = false;
                //    $("#lb_for_product").addClass("err-text").show();
                //} else
                //{
                //    ItemStat.product = true;
                //    isOK = true;
                //}
                break;
            default:
                break;
        }
    });
    return isOK;
}





