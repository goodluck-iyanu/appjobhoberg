async function testFullAggregation() {
  console.log('Testing full feed aggregation across all official remote sources...');

  const categories = ['software-dev', 'customer-support', 'design', 'marketing', 'sales', 'product', 'business', 'data', 'writing', 'hr', 'finance', 'all-others'];
  const jobicyIndustries = ['engineering', 'marketing', 'supporting', 'copywriting', 'business', 'hr', 'management'];

  const fetchPromises = [];

  // 1. Remotive by category
  for (const cat of categories) {
    fetchPromises.push(
      fetch(`https://remotive.com/api/remote-jobs?category=${cat}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.jobs && Array.isArray(data.jobs)) {
            return data.jobs.map((item) => ({
              id: `remotive-${item.id}`,
              title: item.title,
              company_name: item.company_name,
              company_logo_url: item.company_logo_url || item.company_logo || null,
              location: item.candidate_required_location || 'Worldwide (Remote)',
              employment_type: item.job_type || 'Full-time',
              is_remote: true,
              salary_range: item.salary || 'Competitive',
              category: item.category || 'Engineering',
              description: item.description || '',
              apply_url: item.url || 'https://remotive.com',
              source: 'Remotive API',
            }));
          }
          return [];
        })
        .catch(() => [])
    );
  }

  // 2. Jobicy by industry
  for (const ind of jobicyIndustries) {
    fetchPromises.push(
      fetch(`https://jobicy.com/api/v2/remote-jobs?count=50&industry=${ind}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.jobs && Array.isArray(data.jobs)) {
            return data.jobs.map((item) => ({
              id: `jobicy-${item.id}`,
              title: item.jobTitle,
              company_name: item.companyName,
              company_logo_url: item.companyLogo || null,
              location: item.jobGeo ? `${item.jobGeo} (Remote)` : 'Worldwide (Remote)',
              employment_type: item.jobType?.[0] || 'Full-time',
              is_remote: true,
              salary_range: item.salaryMin ? `$${item.salaryMin.toLocaleString()} - $${item.salaryMax?.toLocaleString() || ''}` : 'Competitive',
              category: item.jobIndustry?.[0] || 'General',
              description: item.jobDescription || '',
              apply_url: item.url || 'https://jobicy.com',
              source: 'Jobicy API',
            }));
          }
          return [];
        })
        .catch(() => [])
    );
  }

  // 3. Himalayas
  fetchPromises.push(
    fetch('https://himalayas.app/jobs/api?limit=100', {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.jobs && Array.isArray(data.jobs)) {
          return data.jobs.map((item) => ({
            id: `himalayas-${item.guid?.split('-').pop() || Math.random().toString(36).substring(7)}`,
            title: item.title,
            company_name: item.companyName,
            company_logo_url: item.companyLogo || null,
            location: item.locationRestrictions?.length > 0 ? `${item.locationRestrictions.join(', ')} (Remote)` : 'Worldwide (Remote)',
            employment_type: item.employmentType || 'Full-time',
            is_remote: true,
            salary_range: item.minSalary ? `$${item.minSalary.toLocaleString()} - $${item.maxSalary?.toLocaleString() || ''}` : 'Competitive',
            category: item.categories?.[0] || 'Tech',
            description: item.description || item.excerpt || '',
            apply_url: item.applicationLink || item.guid || 'https://himalayas.app',
            source: 'Himalayas API',
          }));
        }
        return [];
      })
      .catch(() => [])
  );

  // 4. RemoteOK
  fetchPromises.push(
    fetch('https://remoteok.com/api', {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data)) {
          return data
            .filter((item) => item && item.position && item.company)
            .map((item) => ({
              id: `remoteok-${item.id}`,
              title: item.position,
              company_name: item.company,
              company_logo_url: item.company_logo || null,
              location: item.location || 'Worldwide (Remote)',
              employment_type: 'Full-time',
              is_remote: true,
              salary_range: item.salary_min ? `$${item.salary_min.toLocaleString()} - $${item.salary_max?.toLocaleString() || ''} / yr` : 'Competitive',
              category: item.tags?.[0] || 'Engineering',
              description: item.description || '',
              apply_url: item.apply_url || item.url || 'https://remoteok.com',
              source: 'RemoteOK API',
            }));
        }
        return [];
      })
      .catch(() => [])
  );

  const results = await Promise.all(fetchPromises);
  const allJobs = results.flat();

  // Deduplicate
  const seen = new Set();
  const unique = [];
  for (const j of allJobs) {
    const key = `${(j.title || '').toLowerCase().trim()}___${(j.company_name || '').toLowerCase().trim()}`;
    if (!seen.has(key) && j.title && j.company_name) {
      seen.add(key);
      unique.push(j);
    }
  }

  console.log('Total Raw Jobs Fetched:', allJobs.length);
  console.log('Total Unique Real Remote Jobs:', unique.length);
  console.log('Sample Job Sources:');
  const sources = {};
  for (const j of unique) {
    sources[j.source] = (sources[j.source] || 0) + 1;
  }
  console.log(sources);
}

testFullAggregation();

