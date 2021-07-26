let rq = require('request-promise');
const fs = require('fs');

const { parentPort, workerData } = require('worker_threads');

const { code } = workerData;

rq = rq.defaults({
    baseUrl: 'https://diemthi.tuoitre.vn',
    headers: {
        'content-type': 'application/json;charset=UTF-8',
        Cookie: '_ga=GA1.2.1978908831.1627224812; _gid=GA1.2.519006398.1627224812; _uidcms=1627224813052626018; __RC=39; __R=2; __UF=-1; __tb=0; __uidac=33b3ebca825e7f9220277a5f44881408; wurfljs_cache={"advertised_browser":"Mobile Safari","advertised_browser_version":"14.1","advertised_device_os":"iOS","advertised_device_os_version":"14.5.1","brand_name":"Apple","complete_device_name":"Unknow","device_os":"iOS","form_factor":"Smartphone","is_app_webview":false,"is_full_desktop":false,"is_mobile":true,"is_robot":false,"is_smartphone":true,"is_smarttv":false,"is_tablet":false,"manufacturer_name":"","marketing_name":"","max_image_height":568,"max_image_width":320,"model_name":"iPhone","physical_screen_height":89,"physical_screen_width":50,"pointing_method":"touchscreen","release_date":"2017_june","release_msrp":1150,"resolution_height":1136,"resolution_width":640,"webp_lossless_support":true,"webp_lossy_support":true,"version":"11ec00d"}; __uif=__uid:6265807472064849205|__create:1626580747',
    },
});

const filleZero = n =>
    n.toLocaleString('en', { minimumIntegerDigits: 6, useGrouping: false });

const getMark = sbd => {
    return new Promise(async (resolve, reject) => {
        try {
            if (sbd.length === 7) sbd = '0' + sbd;
            const { data } = await rq({
                uri: '/search-thpt-score',
                method: 'POST',
                body: {
                    code: '',
                    data: sbd,
                },
                json: true,
            });

            const { score } = data[0]._source;

            resolve({ sbd, score });
        } catch (error) {
            reject(error);
        }
    });
};

const multiCrawler = async (code, start, LIMIT = 100) => {
    const multi = [];
    const res = [];
    for (let i = start; i < start + LIMIT; i++) {
        multi.push(getMark(`${code}${filleZero(i)}`));
    }
    const resp = await Promise.allSettled(multi);
    resp.forEach(item => {
        if (item.status === 'fulfilled')
            res.push(Object.values(item.value).join('|'));
    });

    if (res.length === 0) return;
    fs.appendFileSync(`${code}.txt`, '\n' + res.join('\n'));
};

const crawlerData = async code => {
    let start = 0;
    let end = 100000;
    while (start < end) {
        console.log(`${code} : ${start}`);
        await multiCrawler(code, start);
        start += 100;
    }
    return true;
};

(async () => {
    const data = await crawlerData(code);
    parentPort.postMessage(data);
})();
