$(function() {
    $("#date_of_purchase").datepicker($.datepicker.regional["en-GB"]);
    $("#date_of_purchase").datepicker("option", "firstDay", "1");
    $("#date_of_purchase").datepicker("option", "dateFormat", "dd/mm/yy");
    $("#date_of_purchase").datepicker("option", "minDate", "01/10/20");
    $("#date_of_purchase").datepicker("option", "maxDate", "31/01/21");
    $("#date_of_purchase").datepicker("option", "changeMonth", true);
    $("#date_of_purchase").datepicker("option", "changeYear", true);
});

$(function() {
    var repeatable_indexes = Array();

    $('body').on('click', '.repeatable_add', function (e) {
        e.preventDefault();

        var totalPriceInput = $(this).parents('.repeatable_block_item').find('.total_price');

        if(totalPriceInput.val() <= 0 && totalPriceInput.is(":visible")) {
            $('.cfg-submit').val("[[SUBMIT_ERROR_TXT]]").prop('disabled', true);
            alert("[[INLINE_JS_MESSAGE_1]]");
            return false;
        } else {
            $('.cfg-submit').val('Submit').prop('disabled', false);
        }

        var type = $(this).attr('data-repeatable_block_type');

        if(!repeatable_indexes[type])
            repeatable_indexes[type] = 0;

        repeatable_indexes[type]++;

        var repeatable_block_class = 'repeatable_block_item_' + type + '_' + repeatable_indexes[type];

        // get the first item
        var block = $(this).parent('p').siblings('.repeatable_block_container_' + type + ' .repeatable_block_item').first().html();

        block = '<div class="repeatable_block_item ' + repeatable_block_class + '">' + block + '<a class="remove remove_repeatable_block" href="javascript:void(0);">[[REMOVE]]</a></div>';

        // split type
        var name_type = type;
        if(name_type == 'purchases0gifts')
            name_type = 'gifts';


        block = block.replace(new RegExp(name_type + '_0_', 'g'), name_type + '_' + repeatable_indexes[type] + '_');
        block = block.replace(new RegExp(name_type + '\\\]\\\[0', 'g'), name_type + '][' + repeatable_indexes[type]);
        block = block.replace(new RegExp(name_type + '\\\[0', 'g'), name_type + '[' + repeatable_indexes[type]);

        $(this).parent('p').before(block);

        // clicked the "Add Purchase" button
        if ($(this).attr('data-repeatable_block_type') === "purchases") { 
            $('.' + repeatable_block_class).prepend('<hr class="block_separator">'); // separator
            // hide all of the extra fields & reset classes				
            $('.' + repeatable_block_class).find('.total_price').removeClass('price_error');
            $('.' + repeatable_block_class).find('select[id$="gift"]:not(:first)').parent('.cfg-element-content').parent('.cfg-element-set').parent('.cfg-element-container').parent('.repeatable_block_item').remove();
            $('.' + repeatable_block_class).find('select[id$="gift"]').parent('.cfg-element-content').parent('.cfg-element-set').parent('.cfg-element-container').hide();
            $('.' + repeatable_block_class).find('.total_price').closest('.cfg-element-container').hide();
            $('.' + repeatable_block_class).find('.repeatable_add').hide();
        }
    });

    $('input.send').click(function (e)
    {
        e.preventDefault();

        // lock submit button
        $(this).attr('disabled', true);

        // remove inputs related to deleted files
        var files_to_keep = '';
        $('.uploadifive-queue-item .filename').each(function () {
            var filename = '.' + $(this).text();

            files_to_keep += (files_to_keep ? ',' : '');
            files_to_keep += '[value$=\'' + filename + '\']'
        });
        $('.receipt_invoice_file').not(files_to_keep).remove();

        // remove error messages
        $('.form_error').remove();
        $('.error_label').removeClass('error_label');

        var data = $('input, textarea, select, checkbox').serialize();
        $.post('form_submit.php', data, function (r) {

            $('input.send').removeAttr('disabled');

            if(r['status'] == 1)
            {
                window.location.href = '[[FORM_SUCCESS_DESTINATION]]';
            }
            else
            {
                if(r['data'])
                {
                    $('input.send').after('<div class="form_error">' + r['message'] + '</div>');

                    for(var i = 0; i < r['data'].length; i++)
                    {
                        var input = r['data'][i]['input'];

                        $('label[for="' + input + '"]').addClass('error_label');
                        $('#' + input).before('<div class="form_error">' + r['data'][i]['message'] + '</div>');
                    }
                }
            }
        }, 'json')
    });
});

var receipt_invoice_i = 0;

$(function () {
    $('#file_upload').uploadifive({
        'auto': false,
        'formData': {
            'timestamp': '[[TIMESTAMP]]',
            'token': '[[TOKEN]]'
        },
        'queueID': 'queue',
        'uploadLimit': 5,
  'buttonText': '[[SELECT_FILES_BUTTON_LABEL]]',
        'uploadScript': '/uploadifive.php',
        'onSelect': function (queue) {
            $('.confirm_upload').slideDown('slow');
            $("#attach").slideDown("slow");
        },
        'onUploadComplete': function (file, data) {
            $('#file_upload').before('<input type="hidden" class="receipt_invoice_file" id="receipt_invoice_' + receipt_invoice_i + '" name="receipt_invoice[' + receipt_invoice_i + ']" value="' + data + '" />');
            receipt_invoice_i++;
        }
    });
});

$( document ).ready(function() {
    if ($('.select_your_purchase option:nth-child(1)').is(":selected")) {
        $('.repeatable_block_container_purchases0gifts').find('[id$="gift"]').closest('.cfg-element-container').hide();
        $('.total_price').closest('.cfg-element-container').hide();
    }
});

$('body').on('change', '.select_your_purchase', function ()
{
    if ($(this).val() !== "0") {
        $(this).parents('.repeatable_block_item').find('[id$="gift"]').closest('.cfg-element-container').show();
        $(this).parents('.repeatable_block_item').find('.total_price').closest('.cfg-element-container').show();
        $(this).parents('.repeatable_block_item').find("[data-repeatable_block_type$='gifts']").show();
    } else {
        $(this).parents('.repeatable_block_item').find('[id$="gift"]').closest('.cfg-element-container').hide();
        $(this).parents('.repeatable_block_item').find('.total_price').closest('.cfg-element-container').hide();
        $(this).parents('.repeatable_block_item').find("[data-repeatable_block_type$='gifts']").hide();
    }

    var selected = $(this).val();
    var gifts_field = $(this).parents('.repeatable_block_item').find('.your_gift');
    $(gifts_field).prop("selectedIndex", 0);

    // remove additional gift fields
    $(this).parents('.repeatable_block_item').find('.your_gift:not(:first)').parent('.cfg-element-content').parent('.cfg-element-set').parent('.cfg-element-container').parent('.repeatable_block_item').remove();

    // hide all
    $(gifts_field).find('option').slice(1).attr('disabled', 'disabled').hide();

    switch(selected)
    {
        case 'R171000':
            $(gifts_field).find('option[value=R158002]').first().removeAttr('disabled').show();
            $(this).parents('.repeatable_block_item').find("[data-repeatable_block_type$='gifts']").hide();
            $(this).parents('.repeatable_block_item').last().find('.total_price').closest('.cfg-element-container').hide();

            break;
        case 'R156005':
            $(gifts_field).find('option[value=R158004]').first().removeAttr('disabled').show();
            $(this).parents('.repeatable_block_item').find("[data-repeatable_block_type$='gifts']").hide();
            $(this).parents('.repeatable_block_item').last().find('.total_price').closest('.cfg-element-container').hide();

            break;

        case 'R163001':
        case 'R163000':
            var totalSpendAvailable = parseFloat($(this).find("option:selected").data('total-spend'));
            
            $(gifts_field).find('option').removeAttr('disabled').show();
            $(this).parents('.repeatable_block_item').find("[data-repeatable_block_type$='gifts']").show();
            calculatePrice($(this).parents('.repeatable_block_item').last(), totalSpendAvailable);

            $("body").on("change", ".your_gift", function() {
                calculatePrice($(this).parents('.repeatable_block_item').last(), totalSpendAvailable);
            });

            $(this).parents('.repeatable_block_item').last().find('.total_price').closest('.cfg-element-container').show();

            break;
    }
});

$('body').on('click', '.remove_repeatable_block', function (e) {
    e.preventDefault();
    var parent_container = $(this).parents('.repeatable_block_item').last();
    $(this).parent('.repeatable_block_item').remove();
    calculatePrice(parent_container);
});

function checkMultipleSelectedProducts(parent_container) {

    var gift_counts = {};
    $(parent_container).find(".your_gift option:selected").each(function () {
        if(gift_counts[$(this).val()])
            gift_counts[$(this).val()]++;
        else
            gift_counts[$(this).val()] = 1;
    });

    $.each(gift_counts, function (index, value) {
        if(value > 3) {
            $('.cfg-submit').val("[[SUBMIT_ERROR_TXT]]").prop('disabled', true);
            alert("[[INLINE_JS_MESSAGE_2]]");
        } else {
            $('.cfg-submit').val('Submit').prop('disabled', false);
        }
    });
}

function calculatePrice(parent_container, totalAvailable) {

    if(totalAvailable) {
        // set data attribute
        $(parent_container).data("total-available", totalAvailable);
    } else {
        // get the data attribute
        totalAvailable = parseFloat($(parent_container).data("total-available"));
    }

    checkMultipleSelectedProducts(parent_container);

    var newPrice = totalAvailable;

    $(parent_container).find(".your_gift option:selected:not(.your_gift option:nth-child(1))").each(function() {
        newPrice -= parseFloat($(this).data('price'));
    });

    if (newPrice <= 0) {
        alert("[[INLINE_JS_MESSAGE_3]]");
        $(parent_container).find('.total_price').addClass('price_error');
        $('.cfg-submit').val("[[SUBMIT_ERROR_TXT]]").prop('disabled', true);
    } else {
        $(parent_container).find('.total_price').removeClass('price_error');
        $('.cfg-submit').val('Submit').prop('disabled', false);
    }

    newPrice = newPrice.toFixed(2);
    $(parent_container).find('.total_price').val(newPrice);
}