const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(`${__dirname}/index.html`, 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const iframe = html.match(/<iframe\b[\s\S]*?<\/iframe>/)[0];
assert.doesNotMatch(iframe, /srcdoc=|video-poster/);
assert.match(iframe, /src="https:\/\/fast.wistia.net\/embed\/iframe\//);
assert.doesNotMatch(html, /min-height:700px/);
assert.doesNotMatch(script, /location\.assign|['"]modal['"]/);
assert.match(html, /class="cta cta--desktop" href="#book"/);
for (const asset of html.matchAll(/assets\/[\w.-]+/g)) {
  assert.ok(fs.existsSync(`${__dirname}/${asset[0]}`), asset[0]);
}

for (const mobile of [true, false]) {
  const calendar = { dataset: {} };
  const scripts = [];
  let observer;
  const storedBookings = new Map();
  const context = {
    matchMedia: () => ({ matches: mobile, addEventListener() {} }),
    location: { hash: '', assign: (url) => context.redirect = url },
    sessionStorage: {getItem: (key) => storedBookings.get(key), setItem: (key, value) => storedBookings.set(key, value)},
    document: {
      getElementById: (id) => id === 'my-cal-inline-discover' ? calendar : {},
      createElement: () => ({}),
      head: { appendChild: (node) => { scripts.push(node); return node; } },
      getElementsByTagName: () => [{ parentNode: { insertBefore() {} } }],
    },
    addEventListener() {},
    IntersectionObserver: class {
      constructor(callback, options) { observer = this; this.callback = callback; assert.equal(options.rootMargin, '0px'); }
      observe() {}
      disconnect() {}
    },
  };
  context.window = context;
  vm.runInNewContext(script, context);
  assert.equal(context.fbq.queue.filter((args) => args[0] === 'track' && args[1] === 'PageView').length, 1);
  assert.equal(scripts.length, 0, 'Calendar must not load during initial render');
  {
    observer.callback([{ isIntersecting: false, intersectionRatio:0 }]);
    observer.callback([{ isIntersecting: true, intersectionRatio:0 }]);
    assert.equal(scripts.length, 0);
    observer.callback([{ isIntersecting: true, intersectionRatio:1 }]);
  }
  context.loadCalendar();
  context.loadCalendar();
  assert.equal(scripts.length, 1, 'Load once when visible on either viewport');
  {
    const calls = context.Cal.ns.discover.q;
    assert.equal(calls.filter((args) => args[0] === 'inline').length, 1);
    const inline = calls.find((args) => args[0] === 'inline')[1];
    assert.equal(inline.elementOrSelector, '#my-cal-inline-discover');
    assert.equal(JSON.stringify(inline.config), JSON.stringify({layout:'month_view',useSlotsViewOnSmallScreen:'true'}));
    assert.equal(inline.calLink, 'sumray-ha/discover');
    assert.equal(context.Cal.config.forwardQueryParams, true);
    assert.ok(calls.some((args) => args[0] === 'ui' && args[1].hideEventTypeDetails === false));
    const handlers = calls.filter((args) => args[0] === 'on');
    assert.equal(handlers.length, 1);
    assert.equal(handlers[0][1].action, 'bookingSuccessfulV2');
    assert.ok(!calls.some((args) => args[0] === 'on' && args[1].action !== 'bookingSuccessfulV2'));
    const track = handlers[0][1].callback;
    const schedules = () => context.fbq.queue.filter((args) => args[2] === 'Schedule');
    assert.equal(schedules().length, 0, 'Loading the calendar must not report a booking');
    track({detail:{data:{uid:'booking-a'}}});
    track({detail:{data:{uid:'booking-a'}}});
    assert.equal(schedules().length, 1, 'Repeated success callback counts once');
    assert.equal(schedules()[0][0], 'trackSingle');
    assert.equal(schedules()[0][1], '1656922198355882');
    assert.equal(schedules()[0][4].eventID, 'cal-schedule:booking-a');
    const reloaded = {...context};
    reloaded.window = reloaded;
    vm.runInNewContext(script, reloaded);
    reloaded.trackBooking({detail:{data:{uid:'booking-a'}}});
    assert.equal(schedules().length, 1, 'Restored confirmation must not recount a booking');
    context.trackBooking({detail:{data:{uid:'booking-b'}}});
    assert.equal(schedules().length, 2, 'A different booking counts separately');
    context.sessionStorage = {getItem() {throw Error('blocked');},setItem() {throw Error('blocked');}};
    context.trackBooking({detail:{data:{uid:'booking-c'}}});
    assert.equal(schedules().length, 3, 'Blocked storage must not break tracking');
    context.trackBooking({detail:{data:{}}});
    context.trackBooking({detail:{data:{}}});
    assert.equal(schedules().length, 4, 'Success without an optional UID counts once per page');
    context.fbq = () => {throw Error('blocked');};
    assert.doesNotThrow(() => context.trackBooking({detail:{data:{uid:'booking-d'}}}));
    context.fbq = undefined;
    assert.doesNotThrow(() => context.trackBooking({detail:{data:{uid:'booking-e'}}}));
  }
  assert.equal(context.redirect, undefined, 'No custom redirect');
}
console.log('Passed: assets, original embed, lazy loading, success-only Schedule, correct pixel, deduplication, blocked storage/pixel, no redirect.');
