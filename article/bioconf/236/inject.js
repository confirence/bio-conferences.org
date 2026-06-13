(function () {
    var tpl = document.getElementById('article-tpl');
    var container = document.querySelector('.contaner-for-js-data');

    if (!tpl || !container || typeof articlesData === 'undefined') return;

    // Snapshot existing articles BEFORE any insertions
    var existingArticles = Array.from(container.querySelectorAll(':scope > article'));

    function buildAuthorsHTML(doi, authors) {
        var parts = [];
        authors.forEach(function (author, i) {
            var name = author[0];
            var n = i + 1;
            var isLast = i === authors.length - 1;
            var span = '<span class="author" data-url="/component/author/?dkey=10.1051/bioconf/2026236'
                + doi + '&n=' + n + '">' + name + '</span>';
            if (isLast && authors.length > 1) {
                parts.push('and ' + span);
            } else {
                parts.push(span + ',');
            }
        });
        return parts.join('\n    ');
    }

    // Sort keys numerically so insertion order is predictable
    var keys = Object.keys(articlesData).map(Number).sort(function (a, b) { return a - b; });

    keys.forEach(function (key) {
        var data = articlesData[key];

        // Replace all occurrences of the template doi placeholder with the real doi
        var html = tpl.innerHTML.replace(/03006/g, data.doi);

        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        var el = tmp.firstElementChild;

        // Fill title
        var titleEl = el.querySelector('.article_title_for-js');
        if (titleEl) titleEl.textContent = data.title;

        // Fill authors
        var authorsEl = el.querySelector('.article-authors');
        if (authorsEl) authorsEl.innerHTML = buildAuthorsHTML(data.doi, data.authors);

        // Fill PDF link
        var pdfEl = el.querySelector('.article_doc a[title="PDF"]');
        if (pdfEl) pdfEl.href = 'pdf/bioconf_foset2026_' + data.doi + '.pdf';

        // Interleave: data article N goes after existing article N (1-indexed)
        // Pattern: ex[0], data[1], ex[1], data[2], ex[2], data[3]...
        // Formula: insert after existingArticles[key - 1]
        var insertAfter = existingArticles[key - 1];
        if (insertAfter) {
            insertAfter.after(el);
        } else {
            container.appendChild(el);
        }
    });
})();
