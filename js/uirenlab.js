// JavaScript Document

function count_char_num(ipt,ShowObj,maxNum)
{
    ipt.keyup(function () {
        var text = $(this).val();
        var counter = text.length;
        var leftNum = maxNum - counter;
        
        if (leftNum < 0 ) {
            text = text.substring(0, maxNum);
            $(this).val(text);
            ShowObj.text(maxNum + "/" + maxNum);
        }else
        {
            ShowObj.text(counter + "/" + maxNum);
        }
    });
}