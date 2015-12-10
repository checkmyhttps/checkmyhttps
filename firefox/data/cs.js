//send information from panel to addon
document.getElementById("details").addEventListener("click", function(){
    self.port.emit("send_details", "details pressed");
});