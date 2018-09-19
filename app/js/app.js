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
  
  function img(src) {
    var img = document.createElement("img");
    img.src = src;
    return img;
  }
  
  function typeIconSrc(typeId) {
    switch(typeId) {
      case '1': // Bug
        return 'app/img/bug.png';
      case '16': // Userstory
        return 'app/img/story.png';
      case '10501': // Technical Requirement
        return 'app/img/techreq.png';
      case '11900': // Task
        return 'app/img/task.png';
      default:
       return '';
    }
  }

  /*
   * <div class="ticket">
   *   <div class="ticket-key"></div>
   *   <div class="ticket-annotations"></div>
   *   <div class="ticket-summary></div>
   * </div>
   */
  function ticket(issue) {
    var ticket = div('ticket');

    var ticketNumber = div('ticket-key text');
    ticketNumber.appendChild(text(issue.key)); 
    ticket.appendChild(ticketNumber);

    var ticketAnnotations = div('ticket-annotations text');
    ticketAnnotations.appendChild(text((issue.estimateStatistic.statFieldValue.value || '-') + ' / '));
    ticketAnnotations.appendChild(img(typeIconSrc(issue.typeId)));
    ticket.appendChild(ticketAnnotations);

    var ticketDescription = div('ticket-summary text');
    var wrapper = element('span', "");
    wrapper.appendChild(text(issue.summary));
    ticketDescription.appendChild(wrapper);
    ticket.appendChild(ticketDescription);

    return ticket;      
  }

  function queryparam(name) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split('&')
        .forEach(function (item) {
          tmp = item.split('=');
          if (tmp[0] === name) result = decodeURIComponent(tmp[1]);
        });
    return result;
  }

  function ActiveStateFilter() {
    return {
      apply : function (sprint) {
        return sprint.state === 'ACTIVE';
      } 
    };
  }

  function NameFilter(name) {
    return {
      apply : function (sprint) {
        return sprint.name === name;
      } 
    };
  }

  function GET(url, fn) {
    var async = false;
    var method = 'GET';
    var DONE = 4;
    var OK = 200;

    var req = new XMLHttpRequest();
    req.open(method, url, async);
    req.onreadystatechange = function() {
      if(this.readyState == DONE && this.status == OK) {
        fn(this);
      } else {
        console.log('Http request failed. URL: ' + url);
      }
    };
    req.send();
  }

  function isInArray(needle, haystack) {
    return haystack.indexOf(needle) !== -1;
  }

  var sprintId = null;
  GET('https://jira.sdvrz.de/rest/greenhopper/latest/sprintquery/276', function(response) {
    var data = JSON.parse(response.responseText);
    var sprints = data.sprints;
    var filter = ActiveStateFilter();

    var sprintName = queryparam('sprint');
    if(sprintName) {
      filter = NameFilter(sprintName);
    }

    for(var i = 0; i < sprints.length; i++) {
      var sprint = sprints[i];
      if(filter.apply(sprint)) {
        sprintId = sprint.id;
        return;
      }
    }
  });
 

  if(sprintId) {
    GET('https://jira.sdvrz.de/rest/greenhopper/latest/rapid/charts/sprintreport?rapidViewId=276&sprintId=' + sprintId, function(response) {
      var data = JSON.parse(response.responseText);
      var responseElement = document.getElementById('response');
      var issues = data.contents.issuesNotCompletedInCurrentSprint;
       
      var issueIds = []; 
      var idsParam = queryparam('ids');
      if(idsParam) {
        issueIds = issueIds.concat(idsParam.split(','));
      }

      issues.filter(function(issue) {
        var issueId = issue.key.split('-')[1]; 
	return issueIds.length === 0 || isInArray(issueId, issueIds);
      }).forEach(function(issue) {
        responseElement.appendChild(ticket(issue));
      });
    });
  } else {
    document.body.appendChild(text('Can\'t find sprint'));
    console.log('Can\'t find sprint');
  }
})()
