$(function(){
	if($('#tl-list-user-branches_wrapper').length==1){
		var selectedTab=$( ".nav-tabs>li" ).index( $('.nav-tabs>li.active') );
		var column, add, remove, endpoint, messageadd, messageremove, messageaddredundant, messageremoveredundant;
		column = 1;
		add="Add user to all branches";
		remove="Remove user from all branches";
		endpoint="user/listbranch/";
		messageadd="Added user to #1 branch#2.";
		messageremove="Removed user from #1 branch#2.";
		messageaddredundant="This user is already a member of all branches.";
		messageremoveredundant="There is no branch this user is a member of.";
		//	add the dropdown in the navigation bar over the datatable
		$('.nav.nav-tabs').append('<li class="dropdown pull-right hidden-phone"><a class="dropdown-toggle" data-toggle="dropdown" href="#" style="margin: 0px;">Mass actions&nbsp;<b class="caret"></b></a><ul class="dropdown-menu"><li><a class="massaction" data-toggle="tab" href="#" data-mode="add">'+add+'</a></li><li><a class="massaction" data-toggle="tab" href="#" data-mode="remove">'+remove+'</a></li></ul></li>');		
		//	add onclick listener
		$(document).on('click', '.massaction',function(){
			if($('#tl-mass-action-message').length==1){ //if a completion alert is showing
				$('#tl-mass-action-message').remove();
			}
			var action=$(this).data('mode');
			var message; //message for the completion alert
			if(action=='remove')
				message=messageremove;
			else
				message=messageadd;
			$('#tl-loading-pane').show();
			$infourl=$('.nav.nav-tabs>li:first-child>a').attr('href');
			var id=$infourl.substring($infourl.lastIndexOf('/id:')+4,$infourl.length);
			url=endpoint+"id:"+id;
			$.ajax({
				dataType: "json",
				url: url,
				success: function (data) {
					var deferreds = [];
					$.each( data.data, function( index ){
						if((action=='remove'&&$(this[column]).hasClass('icon-minus'))||(action=='add'&&$(this[column]).hasClass('icon-plus'))){ 
							var dataurl=$(this[column]).data().url;
							deferreds.push(
								$.ajax({
									dataType: "json",
									url:dataurl
								})
							);
						}
					});
					//  add completion alert
					$('.container>.row>.span12').prepend('<div class="alert fade hide in out" id="tl-mass-action-message"><a class="close" data-dismiss="alert" href="#">×</a><div class="padded">astgqaweraeragsrgasga</div></div>');
					if(deferreds.length==0){
						if(action=='remove')
							message=messageremoveredundant;
						else
							message=messageaddredundant;
						$('#tl-mass-action-message').addClass('alert-info');
						$('#tl-mass-action-message>.padded').html(message);
						$('#tl-mass-action-message').show();
						$('#tl-loading-pane').hide();
					}else{
						$( document ).ajaxStop(function() {
							if(deferreds.length==1)
								message=message.replace('#1',"1").replace('#2','');
							else
								message=message.replace('#1',deferreds.length.toString()).replace('#2','es');
							$( document ).unbind('ajaxStop');
							var table=$('.dataTable').DataTable();
							table.ajax.reload();
							$('a.massaction').parent().removeClass('active');
							$('#tl-mass-action-message').addClass('alert-success');
							$('#tl-mass-action-message>.padded').html(message);
							$('#tl-mass-action-message').show();
							$('.nav-tabs>li.active').removeClass('active');
							$( ".nav-tabs>li" )[selectedTab].className+='active';
						});
						$.when.apply(null, deferreds);
					}
				}
			});
		});
	}
});