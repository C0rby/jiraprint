(function() {
 
  function element(tagName, className) {
    var e = document.createElement(tagName);
    e.className = className;
    return e;
  }

  function div(className) {
    return element('div', className);
  }

  function text(content) {
    return document.createTextNode(content);
  }

  /*
   * <div class="ticket">
   *   <div class="ticket-key"></div>
   *   <div class="ticket-assignee"></div>
   *   <div class="ticket-summary></div>
   * </div>
   */
  function ticket(issue) {
    var ticket = div('ticket');

    var ticketNumber = div('ticket-key text');
    ticketNumber.appendChild(text(issue.key)); 
    ticket.appendChild(ticketNumber);

    var ticketAssignee = div('ticket-assignee text');
    ticketAssignee.appendChild(text(issue.assigneeName || ''));
    ticket.appendChild(ticketAssignee);

    var ticketDescription = div('ticket-summary text');
    var wrapper = element('span', "");
    wrapper.appendChild(text(issue.summary));
    ticketDescription.appendChild(wrapper);
    ticket.appendChild(ticketDescription);

    return ticket;      
  }

  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    console.log(this);
    if(this.readyState == 4 && this.status == 200) {
      var data = JSON.parse(this.responseText);
      var responseElement = document.getElementById('response');
      var issues = data.contents.issuesNotCompletedInCurrentSprint;
      for(var i = 0; i < issues.length; i++) {
        responseElement.appendChild(ticket(issues[i]));
      }
    }
  };
  req.open('GET', 'https://[HOST].de/rest/greenhopper/latest/rapid/charts/sprintreport?rapidViewId=[ID]&sprintId=[ID]', false);
  req.send();
})()
