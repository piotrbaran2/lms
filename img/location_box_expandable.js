/*
 * LMS version 1.11-git
 *
 *  (C) Copyright 2001-2017 LMS Developers
 *
 *  Please, see the doc/AUTHORS for more information about authors!
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License Version 2 as
 *  published by the Free Software Foundation.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307,
 *  USA.
 *
 *  $Id$
 */

/*!
 * \brief File used by function.location_box_expandable.php smarty plugin.
 */
$(function() {
    var counter = -1;

    /*!
     * \brief Show/hide single address box.
     */
    $('body').on('click', '.toggle-address', function() {
        $( '#' + $(this).attr( 'data-target' ) ).slideToggle(200);

        if ( $(this).attr('data-state') == 'closed' ) {
            $(this).attr('data-state', 'opened')
                   .text('–');
        } else {
            $(this).attr('data-state', 'closed')
                   .text('+');
        }
    });

    /*!
     * \brief Add new address box to table.
     */
    $('.locbox-addnew').click( function() {
        var _buttonrow = $(this).closest('tr');

        if ( counter == -1 ) {
            counter = $('body').find('.location-box-expandable').length + 1;
        } else {
            ++counter;
        }

        $.ajax({
            url: "?m=customeraddresses&action=getlocationboxhtml&prefix=" + $(this).attr('data-prefix') + "[addresses][" + counter + "]&default_type=1&clear_button=1",
        }).done( function(data) {
            insertRow( _buttonrow, data );
        });
    });

    /*!
     * \brief Update address string name on box input change.
     */
    $('body').on('input', '.location-box-expandable input', function(){
        var box = getLocationBox(this);

        var city   = box.find('[data-address="city"]').val();
        var street = box.find('[data-address="street"]').val();
        var house  = box.find('[data-address="house"]').val();
        var flat   = box.find('[data-address="flat"]').val();

        var location = location_str( city, street, house, flat );
        location = location.length > 0 ? location : '...';

        box.find('.address-full').text( location );
        box.find('[data-address="location"]').val( location );
    });

    /*!
     * \brief Function insert row content into table.
     * Before insert will be generated new id for
     * handle events using inside.
     *
     * \param container jQuery object contains location div
     * \param data      html code with row content
     */
    function insertRow( container, data ) {
        var prev_id = $(data).attr('id');
        var id = lms_uniqid();

        // replace old id with current generated
        data = String(data).replace( prev_id, id );

        // insert data
        var row_content = '';
        var uid = lms_uniqid();

        row_content += '<tr><td class="valign-top">';
        row_content += '<img src="img/location.png" alt="" class="location-box-image" title="' + lmsMessages['locationRecipientAddress'] + '" id="' + uid + '"></td>';
        row_content += '<td>' + data + '</td></tr>';

        $(container).before( row_content );

        $( '#'+uid ).tooltip().removeAttr('id');
    }

    /*!
     * \brief Remove address box.
     */
    $('body').on('click', '.delete-location-box', function() {
        getLocationBox(this).closest('tr').remove();
    });

    /*!
     * \brief Clear address box inputs.
     */
    $('body').on('click', '.clear-location-box', function() {
        var box = getLocationBox(this);

        // find all inputs and clear values
        $( box.find('input') ).each(function( index ) {
            switch ( $(this).attr('type') ) {
                case 'checkbox':
                    $(this).prop('checked', false);
                break;

                case 'text':
                case 'hidden':
                    $(this).val('');
                    $(this).removeAttr('readonly');
                break;
            }
        });

        // clear location address text
        box.find('.address-full').text('...');

        // choose first option for each select inside location box
        $( box.find('select') ).each(function() {
            $(this).val( $(this).find('option:first').val() );
        });
    });

    /*!
     * \brief Use group of checkboxes as radio button by class.
     */
    $('body').on('click', '.lmsui-address-box-def-address', function() {
        var state = this.checked;

        // mark old default location address as normal location address
        // open definitions.php for more
        // 3 = DEFAULT_LOCATION_ADDRESS
        // 2 = LOCATION_ADDRESS
        $( $("input[data-address='address_type']") ).each(function() {
            if ( $(this).val() == 3 ) {
                $(this).val(2);
            }
        });

        // set all image source as empty
        $( $('.location-box-image') ).each(function() {
            $(this).attr('src'  , 'img/location.png')                              // change icon source
                   .attr('title', lmsMessages['locationRecipientAddress'])         // update icon title
                   .tooltip();                                                     // init LMS tooltip
        });

        // unmark all checkboxes
        $( $('.lmsui-address-box-def-address') ).each(function() {
            $(this).prop('checked', false);                                        // uncheck all default address checkboxes
        });

        // toggle current clicked checkbox
        if ( state == true ) {
            $(this).prop('checked', true);                                         // check default address checkbox

            var box = getLocationBox(this);
            box.closest('tr').find('.location-box-image')
                             .attr('src'  , 'img/pin_blue.png')                    // change icon source
                             .attr('title', lmsMessages['defaultLocationAddress']) // update icon title
                             .tooltip();                                           // init LMS tooltip

            box.find("input[data-address='address_type']").val(3);                 // update address type
                                                                                   // 3 = DEFAULT_LOCATION_ADDRESS
        }
    });

    /*!
     * \brief Get closest location box.
     *
     * \param  any object inside box
     * \return box object
     */
    function getLocationBox( _this ) {
        return $( _this ).closest(".location-box-expandable");
    }
});
