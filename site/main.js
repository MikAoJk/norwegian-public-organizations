async function loadData() {
  const statusEl = document.getElementById('status');
  const tableWrapper = document.getElementById('table-wrapper');
  const tableBody = document.getElementById('table-body');

  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.status}`);
    }
    const groups = await response.json();

    tableBody.innerHTML = '';

    groups.forEach((group, idx) => {
      const tr = document.createElement('tr');

      const rankTd = document.createElement('td');
      rankTd.textContent = idx + 1;
      tr.appendChild(rankTd);

      const nameTd = document.createElement('td');
      if (group.orgs.length === 1) {
        const a = document.createElement('a');
        a.href = group.orgs[0].url;
        a.textContent = group.name;
        nameTd.appendChild(a);
      } else {
        const span = document.createElement('span');
        span.textContent = group.name;
        nameTd.appendChild(span);

        const subOrgs = document.createElement('div');
        subOrgs.className = 'sub-orgs';
        subOrgs.appendChild(document.createTextNode('('));

        group.orgs.forEach((org, orgIdx) => {
          const a = document.createElement('a');
          a.href = org.url;
          a.textContent = org.owner;
          subOrgs.appendChild(a);
          if (orgIdx < group.orgs.length - 1) {
            subOrgs.appendChild(document.createTextNode(', '));
          }
        });

        subOrgs.appendChild(document.createTextNode(')'));
        nameTd.appendChild(subOrgs);
      }
      tr.appendChild(nameTd);

      const reposTd = document.createElement('td');
      reposTd.textContent = group.totalRepos;
      tr.appendChild(reposTd);

      tableBody.appendChild(tr);
    });

    statusEl.hidden = true;
    tableWrapper.hidden = false;
  } catch (err) {
    statusEl.textContent = 'Failed to load data. Please try again later.';
    statusEl.classList.add('error');
    console.error(err);
  }
}

loadData();
