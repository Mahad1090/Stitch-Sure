# Urdu translation review

**These Urdu translations are machine-drafted (by Claude Code) and have not been reviewed by an Urdu speaker.**
Do not present them as checked until a native speaker on the team has read them.

## How to review
1. Run the app, switch to اردو, and read each screen in context (see `docs/screenshots/ur-*`).
2. For each row, correct the Urdu in `src/lib/i18n.ts` if needed, then change "no" to "yes" here.
3. Run `node scripts/translation-review.mjs` to refresh the table. A "yes" is kept only while that row's text is unchanged.

## Please check in particular
- Tailoring words: آستین (sleeve), گلا (neckline), تیرا (shoulder), کف ٹرم (cuff trim), بیل آستین (bell sleeves), بوٹ گلا (boat neck).
- Names stay in Latin script (Areeba, Shayan, StitchSure); "Master Mahad" is written ماسٹر مہاد.
- Gender and respect: verbs about Master Mahad use the respectful plural; wording about Areeba avoids gendered verbs where possible.
- Rendering: in bold Nastaliq, سیدھی shows a visible gap before ھ. Check whether that reads acceptably.
- `{curly}` words are filled in by the app and must stay as they are.

## Strings (458)

| Key | English | Urdu | Reviewed |
|---|---|---|---|
| `demo.region` | Prototype controls | نمونے کے کنٹرول | no |
| `demo.tag` | Prototype only | صرف نمونہ | no |
| `demo.viewAs` | View as | کس کی نظر سے | no |
| `demo.note` | Not part of the app. Login is simulated. | یہ ایپ کا حصہ نہیں۔ لاگ اِن فرضی ہے۔ | no |
| `demo.reset` | Reset sample | نمونہ دوبارہ شروع کریں | no |
| `role.customer` | Customer | گاہک | no |
| `role.tailor` | Tailor | درزی | no |
| `role.worker` | Worker | کاریگر | no |
| `nav.customer` | My orders | میرے آرڈر | no |
| `nav.tailor` | Requests | درخواستیں | no |
| `nav.worker` | My jobs | میرے کام | no |
| `nav.open` | Open menu: {list} | مینو کھولیں: {list} | no |
| `nav.close` | Close menu | مینو بند کریں | no |
| `nav.customerCount` | My orders ({count}) | میرے آرڈر ({count}) | no |
| `nav.samples` | Older orders are sample history only in this prototype. | اس نمونے میں پرانے آرڈر صرف دکھانے کے لیے ہیں۔ | no |
| `nav.note.title` | One agreed version | ایک طے شدہ ورژن | no |
| `nav.note.text` | The worker only ever sees the latest approved one. | کاریگر کو ہمیشہ صرف تازہ منظور شدہ ورژن نظر آتا ہے۔ | no |
| `nav.changePending` | Change pending | تبدیلی زیرِ غور | no |
| `nav.noRequest` | no open request | کوئی کھلی درخواست نہیں | no |
| `nav.change` | {part} change | {part} کی تبدیلی | no |
| `bar.current` | Current order | موجودہ آرڈر | no |
| `bar.largeText` | Large text | بڑے حروف | no |
| `order.label` | Order {id} · {garment} | آرڈر {id} · {garment} | no |
| `order.status` | Order status | آرڈر کی حالت | no |
| `order.due` | Due {date} | آخری تاریخ {date} | no |
| `tile.stage` | Production stage | کام کا مرحلہ | no |
| `tile.agreed` | Agreed design | طے شدہ ڈیزائن | no |
| `tile.delivery` | Delivery | حوالگی | no |
| `version.n` | Version {version} | ورژن {version} | no |
| `status.Approved` | Approved | منظور شدہ | no |
| `status.Pending` | Pending | زیرِ غور | no |
| `status.Rejected` | Rejected | نامنظور | no |
| `status.Superseded` | Replaced | بدل دیا گیا | no |
| `status.Can be made` | Can be made | بن سکتا ہے | no |
| `status.Cannot be made` | Cannot be made | نہیں بن سکتا | no |
| `status.Declined` | Declined | قبول نہیں کیا | no |
| `status.Finished` | Finished | مکمل | no |
| `status.Waiting for you` | Waiting for you | آپ کا انتظار ہے | no |
| `status.Waiting for the tailor` | Waiting for the tailor | درزی کا انتظار ہے | no |
| `status.Waiting for the customer` | Waiting for the customer | گاہک کا انتظار ہے | no |
| `status.Agreed` | Agreed design | طے شدہ ڈیزائن | no |
| `rail.label` | Change request status | تبدیلی کی درخواست کی حالت | no |
| `rail.none` | : no change requested yet | : ابھی کوئی تبدیلی نہیں مانگی گئی | no |
| `rail.request` | Request | درخواست | no |
| `rail.review` | Review | جانچ | no |
| `rail.approval` | Approval | منظوری | no |
| `rail.stitching` | Stitching | سلائی | no |
| `rail.done` | done | ہو گیا | no |
| `rail.now` | now | ابھی | no |
| `timeline.title` | Version timeline | ورژن کی تاریخ | no |
| `timeline.hint` | Every change in one shared record. Newest at the bottom. | ہر تبدیلی ایک مشترکہ ریکارڈ میں۔ تازہ ترین سب سے نیچے۔ | no |
| `timeline.notForProduction` | Not for production | سلائی کے لیے نہیں | no |
| `timeline.foot` | Only customer-approved changes become a production version. | صرف گاہک کی منظور کردہ تبدیلی ہی سلائی کا ورژن بنتی ہے۔ | no |
| `fact.sleeve` | Sleeve style | آستین | no |
| `fact.neckline` | Neckline style | گلا | no |
| `fact.fabric` | Fabric | کپڑا | no |
| `fact.due` | Due date | آخری تاریخ | no |
| `fact.reference` | Reference picture | نمونے کی تصویر | no |
| `fact.note` | Design note | ڈیزائن کا نوٹ | no |
| `fact.neededFor` | Needed for | کس موقع کے لیے | no |
| `fact.none` | None | کوئی نہیں | no |
| `fact.referenceFile` | reference.jpg (sample) | reference.jpg (نمونہ) | no |
| `measurements.title` | Measurements | ناپ | no |
| `part.Sleeve` | Sleeve (bazu) | آستین | no |
| `part.Neckline` | Neckline (gala) | گلا | no |
| `garment.alt` | {garment} with {sleeve} and a {neckline} | {garment}: {sleeve}، {neckline} | no |
| `garment.altSelected` | {garment} with {sleeve} and a {neckline}. Selected part: {part} | {garment}: {sleeve}، {neckline}۔ منتخب حصہ: {part} | no |
| `garment.hotspot.Sleeve` | Sleeve | آستین | no |
| `garment.hotspot.Neckline` | Neckline | گلا | no |
| `home.title` | What would you like to do? | آپ کیا کرنا چاہیں گے؟ | no |
| `home.agreed` | Your agreed design | آپ کا طے شدہ ڈیزائن | no |
| `home.change` | Change my design | میرا ڈیزائن بدلیں | no |
| `home.change.help` | Sleeve, neckline, length, pocket, trouser or something else | آستین، گلا، لمبائی، جیب، ٹراؤزر یا کچھ اور | no |
| `home.change.locked` | Stitching has started, so you cannot change the design here. Send Master Mahad a message instead. | سلائی شروع ہو چکی ہے، اس لیے یہاں ڈیزائن نہیں بدل سکتا۔ ماسٹر مہاد کو پیغام بھیجیں۔ | no |
| `home.change.paused` | Work is on hold, so you cannot change the design here. Send Master Mahad a message instead. | کام رکا ہوا ہے، اس لیے یہاں ڈیزائن نہیں بدل سکتا۔ ماسٹر مہاد کو پیغام بھیجیں۔ | no |
| `home.order` | See my order | میرا آرڈر دیکھیں | no |
| `home.order.help` | Design, measurements and history | ڈیزائن، ناپ اور پرانا ریکارڈ | no |
| `home.message` | Message Master Mahad | ماسٹر مہاد کو پیغام بھیجیں | no |
| `home.message.help` | Ask a question or report a problem | سوال پوچھیں یا مسئلہ بتائیں | no |
| `back.choices` | Back to choices | انتخاب پر واپس | no |
| `back.request` | Back to your request | اپنی درخواست پر واپس | no |
| `back` | Back | پیچھے | no |
| `next` | Next | آگے | no |
| `undo.text` | You can still undo your last approval. This ends when the worker starts stitching. | آپ اپنی پچھلی منظوری ابھی واپس لے سکتے ہیں۔ کاریگر کے سلائی شروع کرنے پر یہ موقع ختم ہو جائے گا۔ | no |
| `undo.button` | Undo approval | منظوری واپس لیں | no |
| `orderScreen.title` | Your order | آپ کا آرڈر | no |
| `history.earlier` | Earlier versions ({count}) | پہلے کے ورژن ({count}) | no |
| `history.declined` | Declined suggestions ({count}) | قبول نہ کی گئی تجاویز ({count}) | no |
| `history.noEarlier` | No earlier versions yet. | ابھی کوئی پرانا ورژن نہیں۔ | no |
| `history.noDeclined` | Nothing declined yet. | ابھی کچھ رد نہیں کیا گیا۔ | no |
| `history.replaced` | replaced | بدل دیا گیا | no |
| `message.title` | Message Master Mahad | ماسٹر مہاد کو پیغام | no |
| `message.label` | Your message | آپ کا پیغام | no |
| `message.hint` | Ask a question, or say what is wrong with your order. | سوال پوچھیں، یا بتائیں کہ آرڈر میں کیا مسئلہ ہے۔ | no |
| `message.needText` | Type a message to turn on Send. | بھیجنے کے لیے پہلے پیغام لکھیں۔ | no |
| `message.send` | Send | بھیجیں | no |
| `message.sent` | Sent to Master Mahad. A reply will come in StitchSure. | ماسٹر مہاد کو بھیج دیا گیا۔ جواب StitchSure میں آئے گا۔ | no |
| `message.simulated` | Sample only: nothing is really sent. | صرف نمونہ: حقیقت میں کچھ نہیں بھیجا جاتا۔ | no |
| `form.title` | Change my design | میرا ڈیزائن بدلیں | no |
| `form.step` | Step {step} of 3 | مرحلہ {step} از 3 | no |
| `form.q.part` | Which part do you want to change? | آپ کون سا حصہ بدلنا چاہتے ہیں؟ | no |
| `form.q.style` | Which style do you want? | آپ کون سا انداز چاہتے ہیں؟ | no |
| `form.q.note` | Anything to add? | کچھ اور بتانا ہے؟ | no |
| `form.tapHint` | Tap the picture, or choose below. | تصویر پر دبائیں، یا نیچے سے چنیں۔ | no |
| `form.needPart` | Choose a part to turn on Next. | آگے بڑھنے کے لیے ایک حصہ چنیں۔ | no |
| `form.needStyle` | Choose a style to turn on Next. | آگے بڑھنے کے لیے ایک انداز چنیں۔ | no |
| `form.needNote` | Describe the style in the note to turn on Send. | بھیجنے کے لیے نوٹ میں اپنا انداز لکھیں۔ | no |
| `form.current` | {style} (current) | {style} (موجودہ) | no |
| `form.note.optional` | Note (optional) | نوٹ (اختیاری) | no |
| `form.note.required` | Note (needed: describe the style) | نوٹ (ضروری: اپنا انداز لکھیں) | no |
| `form.note.Sleeve` | e.g. flared opening at the wrist | مثلاً کلائی سے کھلی آستین | no |
| `form.note.Neckline` | e.g. a slightly deeper V | مثلاً تھوڑا گہرا وی گلا | no |
| `form.addPhoto` | Add reference photo | نمونے کی تصویر لگائیں | no |
| `form.removePhoto` | Remove reference photo | تصویر ہٹائیں | no |
| `form.photoAttached` | reference.jpg attached (sample photo) | reference.jpg لگ گئی (نمونہ تصویر) | no |
| `form.photoOptional` | Optional. Sample upload. | اختیاری۔ نمونہ اپ لوڈ۔ | no |
| `form.asking` | You are asking for | آپ یہ مانگ رہے ہیں | no |
| `form.nothingChanges` | Nothing changes until Master Mahad and you both agree. | جب تک آپ اور ماسٹر مہاد دونوں راضی نہ ہوں، کچھ نہیں بدلے گا۔ | no |
| `form.send` | Send request | درخواست بھیجیں | no |
| `form.sending` | Sending… | بھیجی جا رہی ہے… | no |
| `style.describe` | Other: describe it in my own words | کچھ اور: اپنے الفاظ میں بتائیں | no |
| `style.describe.hint` | Write what you want in the box below | جو چاہیے وہ نیچے خانے میں لکھیں | no |
| `style.hint.Bell sleeves` | Flared opening at the wrist | کلائی سے کھلی ہوئی | no |
| `style.hint.Cuff Trim` | Decorative trim on a straight cuff | سیدھے کف پر سجاوٹی پٹی | no |
| `style.hint.Straight sleeve` | Plain, fitted cuff | سادہ، فٹ کف | no |
| `style.hint.Round neckline` | Classic round opening | عام گول گلا | no |
| `style.hint.V-shaped neckline` | Pointed, deeper opening | نوک دار، گہرا گلا | no |
| `style.hint.Boat neckline` | Wide and shallow opening | چوڑا اور کم گہرا گلا | no |
| `waiting.title` | Your request | آپ کی درخواست | no |
| `waiting.note` | Note: “{note}” | نوٹ: “{note}” | no |
| `waiting.noNote` | No note added. | کوئی نوٹ نہیں۔ | no |
| `waiting.photo` | Reference photo attached | نمونے کی تصویر لگی ہوئی ہے | no |
| `waiting.reply` | Your reply: “{answer}” | آپ کا جواب: “{answer}” | no |
| `waiting.same` | Nothing changes until you both agree. | جب تک آپ دونوں راضی نہ ہوں، کچھ نہیں بدلے گا۔ | no |
| `waiting.nextLabel` | What happens next | اب آگے کیا ہوگا | no |
| `waiting.nextText` | Master Mahad checks whether it can be made, and what it changes in cost and delivery. Then you approve it or keep your agreed design. | ماسٹر مہاد دیکھیں گے کہ یہ بن سکتا ہے یا نہیں، اور قیمت اور تاریخ پر کیا اثر ہوگا۔ پھر آپ اسے منظور کریں یا طے شدہ ڈیزائن رکھیں۔ | no |
| `cancel.button` | Cancel request | درخواست منسوخ کریں | no |
| `cancel.question` | Cancel this request? | کیا یہ درخواست منسوخ کریں؟ | no |
| `cancel.same` | Your agreed design stays the same. | آپ کا طے شدہ ڈیزائن ویسا ہی رہے گا۔ | no |
| `cancel.no` | No, keep request | نہیں، درخواست رہنے دیں | no |
| `cancel.yes` | Yes, cancel request | ہاں، منسوخ کریں | no |
| `question.title` | Master Mahad asked | ماسٹر مہاد نے پوچھا | no |
| `question.about` | About your request: {part} → {style} | آپ کی درخواست کے بارے میں: {part} ← {style} | no |
| `question.answer` | Your answer | آپ کا جواب | no |
| `question.placeholder` | e.g. 22 inches, same as before | مثلاً 22 انچ، پہلے جتنا | no |
| `question.reply` | Send reply | جواب بھیجیں | no |
| `decision.title` | Choose an option | ایک انتخاب کریں | no |
| `decision.asked` | You asked for | آپ نے مانگا تھا | no |
| `decision.other` | The tailor offers | درزی کی تجویز | no |
| `decision.confirms` | The tailor confirms | درزی نے تصدیق کی | no |
| `decision.preview` | Preview: {style} | جھلک: {style} | no |
| `decision.cost` | Cost | قیمت | no |
| `decision.dateChange` | Delivery date change | تاریخ میں تبدیلی | no |
| `decision.stillReady` | Still ready before {event} ({date}). | {event} ({date}) سے پہلے تیار ہو جائے گا۔ | no |
| `decision.keep` | Keep my original design | میرا اصل ڈیزائن رکھیں | no |
| `decision.keep.help` | Your order continues with your agreed design (Version {version}). The tailor will be told. | آرڈر طے شدہ ڈیزائن (ورژن {version}) پر ہی چلے گا۔ درزی کو بتا دیا جائے گا۔ | no |
| `decision.approve` | Approve {style} | {style} منظور کریں | no |
| `decision.approve.help` | {style} becomes your agreed design (Version {version}). You can undo until the worker starts. | {style} آپ کا طے شدہ ڈیزائن (ورژن {version}) بن جائے گا۔ سلائی شروع ہونے تک آپ واپس لے سکتے ہیں۔ | no |
| `approved.title` | {style} approved | {style} منظور ہو گیا | no |
| `approved.notice` | This is now your agreed design (Version {version}). The worker can see it. Your old design (Version {old}) is replaced. | اب یہ آپ کا طے شدہ ڈیزائن (ورژن {version}) ہے۔ کاریگر اسے دیکھ سکتا ہے۔ پرانا ڈیزائن (ورژن {old}) بدل دیا گیا ہے۔ | no |
| `approved.design` | Your agreed design: | آپ کا طے شدہ ڈیزائن: | no |
| `approved.started` | The worker has started stitching. | کاریگر نے سلائی شروع کر دی ہے۔ | no |
| `approved.notStarted` | The worker has not started yet. | کاریگر نے ابھی کام شروع نہیں کیا۔ | no |
| `approved.undoUntil` | Undo is available until the worker starts stitching. | سلائی شروع ہونے تک منظوری واپس لی جا سکتی ہے۔ | no |
| `approved.undoGone` | Undo is no longer available because stitching has started. | سلائی شروع ہو چکی ہے، اب منظوری واپس نہیں ہو سکتی۔ | no |
| `tailor.problem.title` | Problem reported by Shayan | Shayan نے مسئلہ بتایا ہے | no |
| `tailor.problem.hold` | Work on SS-014 is on hold until you reply. | آپ کے جواب تک SS-014 کا کام رکا ہوا ہے۔ | no |
| `tailor.problem.solve` | Send reply and resume work | جواب بھیجیں اور کام جاری کروائیں | no |
| `tailor.request.title` | What Areeba wants | Areeba کی فرمائش | no |
| `tailor.empty.title` | No change request yet. | ابھی تبدیلی کی کوئی درخواست نہیں۔ | no |
| `tailor.empty.text` | When Areeba asks for a change, it appears here. | جب Areeba کی طرف سے تبدیلی کی درخواست آئے گی تو یہاں دکھے گی۔ | no |
| `tailor.sentAt` | Requested {at} | درخواست کا وقت {at} | no |
| `tailor.compare` | Current design compared with the requested design | موجودہ اور مانگے گئے ڈیزائن کا موازنہ | no |
| `tailor.now` | Current · Version {version} | موجودہ · ورژن {version} | no |
| `tailor.requested` | Requested | مانگا گیا | no |
| `tailor.note` | Customer’s note | گاہک کا نوٹ | no |
| `tailor.reply` | Reply to your question | آپ کے سوال کا جواب | no |
| `tailor.photo` | Reference photo | نمونے کی تصویر | no |
| `tailor.photoSample` | Sample attachment (simulated upload) | نمونہ تصویر (فرضی اپ لوڈ) | no |
| `tailor.noPhoto` | No reference photo attached. | کوئی تصویر نہیں لگی۔ | no |
| `tailor.seen` | Seen. Still waiting for your review: seen is not the same as accepted. | دیکھ لی گئی۔ آپ کی جانچ ابھی باقی ہے: دیکھنے کا مطلب منظوری نہیں۔ | no |
| `review.title` | Your review | آپ کی جانچ | no |
| `review.question.legend` | Can this be made? | کیا یہ بن سکتا ہے؟ | no |
| `review.choose` | Choose one to continue. Nothing is selected for you. | آگے بڑھنے کے لیے ایک چنیں۔ پہلے سے کچھ منتخب نہیں۔ | no |
| `outcome.Possible` | Can be made | بن سکتا ہے | no |
| `outcome.Impossible` | Cannot be made | نہیں بن سکتا | no |
| `outcome.Needs clarification` | Ask a question | سوال پوچھیں | no |
| `outcome.help.Possible` | Areeba sees your cost and delivery effect, then decides. | Areeba کو قیمت اور تاریخ کا اثر دکھے گا، پھر فیصلہ ہوگا۔ | no |
| `outcome.help.Impossible` | Say why, and offer one design you can make. The agreed design stays until Areeba decides. | وجہ لکھیں اور ایک ڈیزائن تجویز کریں جو بن سکے۔ فیصلے تک طے شدہ ڈیزائن ہی رہے گا۔ | no |
| `outcome.help.Needs clarification` | Ask one clear question. Nothing changes in production until Areeba answers. | ایک صاف سوال پوچھیں۔ جواب آنے تک سلائی میں کچھ نہیں بدلے گا۔ | no |
| `review.question` | Your question to the customer | گاہک سے آپ کا سوال | no |
| `review.reason` | Reason it cannot be made (required) | کیوں نہیں بن سکتا (ضروری) | no |
| `review.noteOptional` | Note for Areeba (optional) | Areeba کے لیے نوٹ (اختیاری) | no |
| `review.alternative` | Offer this instead (required) | اس کی جگہ یہ تجویز کریں (ضروری) | no |
| `review.cost` | Cost effect | قیمت پر اثر | no |
| `review.date` | Delivery effect | حوالگی کی تاریخ پر اثر | no |
| `review.preview` | Areeba will receive | Areeba کو یہ پیغام ملے گا | no |
| `review.simulated` | Sample only: nothing is really sent. | صرف نمونہ: حقیقت میں کچھ نہیں بھیجا جاتا۔ | no |
| `review.send` | Send review to customer | گاہک کو جواب بھیجیں | no |
| `review.sendQuestion` | Send question | سوال بھیجیں | no |
| `review.waitingReply` | Question sent. Waiting for Areeba to reply. | سوال بھیج دیا گیا۔ Areeba کے جواب کا انتظار ہے۔ | no |
| `review.waitingDecision` | Sent. The request stays open until Areeba decides. | بھیج دیا گیا۔ Areeba کے فیصلے تک درخواست کھلی رہے گی۔ | no |
| `review.sentLabel` | What you sent | آپ نے کیا بھیجا | no |
| `review.field.outcome` | Outcome | نتیجہ | no |
| `review.field.question` | Question | سوال | no |
| `review.field.reason` | Reason | وجہ | no |
| `review.field.alternative` | Alternative | متبادل | no |
| `review.field.cost` | Cost | قیمت | no |
| `review.field.delivery` | Delivery | حوالگی | no |
| `review.approved` | Areeba approved this. Version {version} is now the only version Shayan sees. | Areeba کی منظوری مل گئی۔ اب Shayan کو صرف ورژن {version} نظر آتا ہے۔ | no |
| `review.declined` | Areeba kept the original design. Nothing changes for Shayan. | Areeba نے اصل ڈیزائن ہی رکھا۔ Shayan کے لیے کچھ نہیں بدلا۔ | no |
| `stage.summary` | Fabric stage: {stage} | کپڑے کا مرحلہ: {stage} | no |
| `stage.legend` | Production stage | کام کا مرحلہ | no |
| `stage.hint` | Cutting and stitching limit which changes are still possible. | کٹائی اور سلائی کے بعد کچھ تبدیلیاں ممکن نہیں رہتیں۔ | no |
| `stage.cutAdvisory` | Fabric is already cut. Bell sleeves usually can’t be made now. Consider offering Cuff Trim. | کپڑا کٹ چکا ہے۔ اب بیل آستین عموماً نہیں بن سکتی۔ کف ٹرم تجویز کرنے پر غور کریں۔ | no |
| `tailor.more` | More about this order | اس آرڈر کے بارے میں مزید | no |
| `tailor.customer` | Customer and order details | گاہک اور آرڈر کی تفصیل | no |
| `tailor.history` | Order history | آرڈر کا ریکارڈ | no |
| `tailor.relevant` | Relevant to this request | اس درخواست سے متعلق | no |
| `tailor.sample` | Sample data | نمونہ معلومات | no |
| `detail.order` | Order | آرڈر | no |
| `detail.placed` | Placed | آرڈر کی تاریخ | no |
| `worker.badge` | Current | موجودہ | no |
| `worker.meta` | {id} · {name} · Approved by customer on {date} | {id} · {name} · گاہک کی منظوری {date} | no |
| `worker.updated` | Updated: Version {version} replaced Version {old}. Check the new details, then confirm you have read them. | نئی تبدیلی: ورژن {old} کی جگہ ورژن {version} آ گیا ہے۔ نئی تفصیل دیکھیں، پھر تصدیق کریں کہ آپ نے پڑھ لی ہے۔ | no |
| `worker.job` | What to make (Version {version}) | کیا بنانا ہے (ورژن {version}) | no |
| `worker.notes` | Customer’s note | گاہک کا نوٹ | no |
| `worker.pending` | A change is waiting for the customer’s decision. Do not start stitching yet. | ایک تبدیلی پر گاہک کا فیصلہ باقی ہے۔ ابھی سلائی شروع نہ کریں۔ | no |
| `worker.paused` | Problem reported. Work on this part is on hold until Master Mahad replies. | مسئلہ بتا دیا گیا ہے۔ ماسٹر مہاد کے جواب تک اس حصے کا کام رکا ہوا ہے۔ | no |
| `worker.finished` | Marked as finished. Master Mahad has been told. | کام مکمل درج ہو گیا۔ ماسٹر مہاد کو بتا دیا گیا ہے۔ | no |
| `worker.read` | I have read the current version | میں نے موجودہ ورژن پڑھ لیا ہے | no |
| `worker.start` | Start stitching | سلائی شروع کریں | no |
| `worker.finish` | Finish stitching | سلائی مکمل کریں | no |
| `worker.check` | Check this one | یہ ناپ ضرور دیکھیں | no |
| `worker.earlier` | Earlier version (replaced) | پچھلا ورژن (بدل دیا گیا) | no |
| `worker.doNotUse` | Replaced. Do not use. | بدل دیا گیا۔ استعمال نہ کریں۔ | no |
| `worker.report` | Report a problem | مسئلہ بتائیں | no |
| `report.kind` | What kind of problem? | کس قسم کا مسئلہ ہے؟ | no |
| `report.describe` | Describe the problem | مسئلہ لکھیں | no |
| `report.hint` | Master Mahad gets this in StitchSure. Work on this part goes on hold until there is a reply. | یہ StitchSure میں ماسٹر مہاد کو ملے گا۔ جواب آنے تک اس حصے کا کام رکا رہے گا۔ | no |
| `report.placeholder` | Name the part and what is wrong… | حصے کا نام اور خرابی لکھیں… | no |
| `report.send` | Send report | رپورٹ بھیجیں | no |
| `report.cancel` | Cancel report | رپورٹ منسوخ کریں | no |
| `term.Sleeve` | Sleeve | آستین | no |
| `term.Neckline` | Neckline | گلا | no |
| `term.Bell sleeves` | Bell sleeves | بیل آستین | no |
| `term.Cuff Trim` | Cuff Trim | کف ٹرم | no |
| `term.Straight sleeve` | Straight sleeve | سیدھی آستین | no |
| `term.Round neckline` | Round neckline | گول گلا | no |
| `term.V-shaped neckline` | V-shaped neckline | وی گلا | no |
| `term.Boat neckline` | Boat neckline | بوٹ گلا | no |
| `term.Not cut` | Not cut | کٹائی نہیں ہوئی | no |
| `term.Cut` | Cut | کٹ چکا | no |
| `term.Stitching` | Stitching | سلائی جاری | no |
| `term.Measurement unclear` | Measurement unclear | ناپ واضح نہیں | no |
| `term.Fabric issue` | Fabric issue | کپڑے کا مسئلہ | no |
| `term.Instructions conflict` | Instructions conflict | ہدایات آپس میں نہیں ملتیں | no |
| `term.Other` | Other | کچھ اور | no |
| `term.Purple kurta` | Purple kurta | جامنی کرتا | no |
| `term.Maroon kameez` | Maroon kameez | میرون قمیض | no |
| `term.Green kurta` | Green kurta | سبز کرتا | no |
| `term.Cream shalwar` | Cream shalwar | کریم شلوار | no |
| `term.Cotton · Purple · 3 gaz` | Cotton · Purple · 3 gaz | سوتی · جامنی · 3 گز | no |
| `term.Cousin’s mehndi` | Cousin’s mehndi | کزن کی مہندی | no |
| `term.Chest` | Chest | چھاتی | no |
| `term.Shoulder` | Shoulder | تیرا | no |
| `term.Sleeve length (bazu)` | Sleeve length (bazu) | آستین کی لمبائی | no |
| `term.Neck depth (gala)` | Neck depth (gala) | گلے کی گہرائی | no |
| `term.Kurta length (lambai)` | Kurta length (lambai) | کرتے کی لمبائی | no |
| `term.Customer` | Customer | گاہک | no |
| `term.Tailor` | Tailor | درزی | no |
| `term.Stitching worker` | Stitching worker | سلائی کاریگر | no |
| `term.Phone · 03•• ••• 0000` | Phone · 03•• ••• 0000 | فون · 03•• ••• 0000 | no |
| `term.In production` | In production | تیاری میں | no |
| `lang.label` | Language / زبان | Language / زبان | no |
| `arrow` | → | ← | no |
| `error.noPart` | Choose which part to change, then send again. Your note is kept. | پہلے چنیں کہ کون سا حصہ بدلنا ہے، پھر دوبارہ بھیجیں۔ آپ کا نوٹ محفوظ ہے۔ | no |
| `error.noStyle` | Choose a style, or pick “Other” and describe it in your own words. Your note is kept. | کوئی انداز چنیں، یا “کچھ اور” چن کر اپنے الفاظ میں بتائیں۔ آپ کا نوٹ محفوظ ہے۔ | no |
| `error.noNote` | Describe the style you want in the note, or choose a listed style. Your choices are kept. | نوٹ میں اپنا انداز لکھیں، یا فہرست سے کوئی انداز چنیں۔ آپ کے انتخاب محفوظ ہیں۔ | no |
| `error.alreadyPending` | You already have a request waiting. Cancel it or wait for the tailor before sending another. | آپ کی ایک درخواست پہلے ہی انتظار میں ہے۔ نئی بھیجنے سے پہلے اسے منسوخ کریں یا درزی کا انتظار کریں۔ | no |
| `error.locked` | Stitching has started. Ask the tailor before requesting another change. | سلائی شروع ہو چکی ہے۔ نئی تبدیلی مانگنے سے پہلے درزی سے پوچھیں۔ | no |
| `error.cannotCancel` | This request can no longer be cancelled here. Choose an option instead. | یہ درخواست اب یہاں منسوخ نہیں ہو سکتی۔ اس کی جگہ ایک انتخاب کریں۔ | no |
| `error.noRequestToReview` | Open a waiting customer request first. | پہلے گاہک کی انتظار میں پڑی درخواست کھولیں۔ | no |
| `error.needReason` | Add why it cannot be made and one design you can offer instead, then send again. Your entries are kept. | لکھیں کہ یہ کیوں نہیں بن سکتا اور ایک متبادل ڈیزائن تجویز کریں، پھر دوبارہ بھیجیں۔ آپ کا لکھا محفوظ ہے۔ | no |
| `error.needQuestion` | Type the question you need the customer to answer, then send again. | گاہک سے پوچھنے والا سوال لکھیں، پھر دوبارہ بھیجیں۔ | no |
| `error.fabricCut` | Fabric is already cut. Bell sleeves can’t be made. Mark “Cannot be made” and offer Cuff Trim. Your entries are kept. | کپڑا کٹ چکا ہے۔ بیل آستین نہیں بن سکتی۔ “نہیں بن سکتا” چنیں اور کف ٹرم تجویز کریں۔ آپ کا لکھا محفوظ ہے۔ | no |
| `error.needCost` | Enter the cost and delivery effect before sending. Your entries are kept. | بھیجنے سے پہلے قیمت اور تاریخ پر اثر لکھیں۔ آپ کا لکھا محفوظ ہے۔ | no |
| `error.noQuestion` | There is no question waiting for you. | اس وقت آپ کے لیے کوئی سوال نہیں۔ | no |
| `error.noAnswer` | Type your answer, then send it. | اپنا جواب لکھیں، پھر بھیجیں۔ | no |
| `error.waitForTailor` | Wait for the tailor’s answer before approving. | منظور کرنے سے پہلے درزی کے جواب کا انتظار کریں۔ | no |
| `error.needDesign` | A design that can be made is needed before approval. | منظوری سے پہلے ایک ایسا ڈیزائن چاہیے جو بن سکے۔ | no |
| `error.nothingToUndo` | There is no approval to undo. | واپس لینے کے لیے کوئی منظوری نہیں۔ | no |
| `error.undoTooLate` | The worker has started stitching, so this approval can no longer be undone. Ask Master Mahad instead. | کاریگر سلائی شروع کر چکا ہے، اس لیے اب منظوری واپس نہیں ہو سکتی۔ ماسٹر مہاد سے بات کریں۔ | no |
| `error.nothingToDecline` | There is no open request to decline. | رد کرنے کے لیے کوئی کھلی درخواست نہیں۔ | no |
| `error.notRead` | Confirm you have read the current version before starting. Tick “I have read the current version”, then start again. | شروع کرنے سے پہلے تصدیق کریں کہ آپ نے موجودہ ورژن پڑھ لیا ہے۔ “میں نے موجودہ ورژن پڑھ لیا ہے” پر نشان لگائیں، پھر دوبارہ شروع کریں۔ | no |
| `error.changePending` | A change is waiting for the customer’s decision. Wait before stitching. | ایک تبدیلی پر گاہک کا فیصلہ باقی ہے۔ سلائی سے پہلے انتظار کریں۔ | no |
| `error.onHold` | This job is on hold until Master Mahad replies to your report. | آپ کی رپورٹ پر ماسٹر مہاد کے جواب تک یہ کام رکا ہوا ہے۔ | no |
| `error.notStarted` | Start stitching before marking the job as finished. | کام مکمل درج کرنے سے پہلے سلائی شروع کریں۔ | no |
| `error.noKind` | Choose what kind of problem it is, then send the report. | مسئلے کی قسم چنیں، پھر رپورٹ بھیجیں۔ | no |
| `error.noProblem` | Describe the problem so Master Mahad can fix it. Your choice is kept. | مسئلہ لکھیں تاکہ ماسٹر مہاد اسے حل کر سکیں۔ آپ کا انتخاب محفوظ ہے۔ | no |
| `msg.requestSent` | Request sent to Master Mahad. | درخواست ماسٹر مہاد کو بھیج دی گئی۔ | no |
| `msg.cancelled` | Request cancelled. Your agreed design (Version {version}) stays the same. | درخواست منسوخ ہو گئی۔ آپ کا طے شدہ ڈیزائن (ورژن {version}) ویسا ہی ہے۔ | no |
| `msg.stage` | Production stage set to {stage}. | کام کا مرحلہ مقرر ہوا: {stage}۔ | no |
| `msg.questionSent` | Question sent to Areeba. | سوال Areeba کو بھیج دیا گیا۔ | no |
| `msg.reviewSent` | Review sent to Areeba. The request stays open until she decides. | جواب Areeba کو بھیج دیا گیا۔ فیصلے تک درخواست کھلی رہے گی۔ | no |
| `msg.replySent` | Reply sent to Master Mahad. | جواب ماسٹر مہاد کو بھیج دیا گیا۔ | no |
| `msg.approved` | {design} approved. It is now the agreed design (Version {version}). | {design} منظور ہو گیا۔ اب یہی طے شدہ ڈیزائن ہے (ورژن {version})۔ | no |
| `msg.undone` | Approval undone. Version {version} is current again. Choose an option. | منظوری واپس ہو گئی۔ ورژن {version} پھر سے موجودہ ہے۔ ایک انتخاب کریں۔ | no |
| `msg.keptOriginal` | Tailor notified: original design kept. | درزی کو بتا دیا گیا: اصل ڈیزائن رکھا گیا ہے۔ | no |
| `msg.started` | Stitching started using approved Version {version}. | منظور شدہ ورژن {version} پر سلائی شروع ہو گئی۔ | no |
| `msg.finished` | Marked as finished. Master Mahad has been told. | کام مکمل درج ہو گیا۔ ماسٹر مہاد کو بتا دیا گیا ہے۔ | no |
| `msg.solved` | Problem marked as solved. Shayan can continue. | مسئلہ حل شدہ درج ہو گیا۔ Shayan کام جاری رکھ سکتا ہے۔ | no |
| `msg.reported` | Report sent to Master Mahad. Work on this part is on hold until he replies. | رپورٹ ماسٹر مہاد کو بھیج دی گئی۔ جواب تک اس حصے کا کام رکا رہے گا۔ | no |
| `event.original.title` | Version 1 · Original design | ورژن 1 · اصل ڈیزائن | no |
| `event.pair` | {first} · {second} | {first} · {second} | no |
| `event.partStyle` | {part}: {style} | {part}: {style} | no |
| `event.quote` | “{note}” | “{note}” | no |
| `event.styleNote` | {style} · “{note}” | {style} · “{note}” | no |
| `event.plain` | {text} | {text} | no |
| `event.requested.title` | {part} change requested | {part} بدلنے کی درخواست | no |
| `event.cancelled.title` | Customer cancelled the request | گاہک نے درخواست منسوخ کی | no |
| `event.asked.title` | Tailor asked a question | درزی نے سوال پوچھا | no |
| `event.review.title` | Tailor review | درزی کی جانچ | no |
| `event.review.text` | {verdict} · {reason}{offer} | {verdict} · {reason}{offer} | no |
| `event.review.possible` | Requested design is possible | مانگا گیا ڈیزائن بن سکتا ہے | no |
| `event.review.offer` |  · Offer: {alternative} |  · تجویز: {alternative} | no |
| `event.replied.title` | Customer replied | گاہک نے جواب دیا | no |
| `event.approved.title` | Version {version} · Customer approved | ورژن {version} · گاہک نے منظور کیا | no |
| `event.approved.text` | {part}: {design} · {cost} · {date} | {part}: {design} · {cost} · {date} | no |
| `event.undone.title` | Customer undid the approval | گاہک نے منظوری واپس لی | no |
| `event.undone.text` | Version {version} is current again. | ورژن {version} پھر سے موجودہ ہے۔ | no |
| `event.rejected.title` | Customer kept the original design | گاہک نے اصل ڈیزائن رکھا | no |
| `event.rejected.text` | Declined: {design}. Version {version} stays current. | قبول نہیں کیا: {design}۔ ورژن {version} ہی موجودہ ہے۔ | no |
| `event.finished.title` | Worker finished stitching | کاریگر نے سلائی مکمل کی | no |
| `event.solved.title` | Tailor solved the problem | درزی نے مسئلہ حل کیا | no |
| `event.solved.text` | Work can continue. | کام جاری رہ سکتا ہے۔ | no |
| `event.reported.title` | Worker reported a problem | کاریگر نے مسئلہ بتایا | no |
| `declined.impossible` | {design}, cannot be made · {date} | {design}، نہیں بن سکتا · {date} | no |
| `declined.declined` | {design}, declined · {date} | {design}، قبول نہیں کیا · {date} | no |
| `head.sending` | Sending your request | آپ کی درخواست بھیجی جا رہی ہے | no |
| `head.sending.next` | Please wait. Your note and reference are kept. | ذرا انتظار کریں۔ آپ کا نوٹ اور تصویر محفوظ ہیں۔ | no |
| `head.t.paused` | The worker reported a problem | کاریگر نے مسئلہ بتایا ہے | no |
| `head.t.paused.next` | Work on SS-014 is on hold until you reply. | آپ کے جواب تک SS-014 کا کام رکا ہوا ہے۔ | no |
| `head.t.none` | No open requests | کوئی کھلی درخواست نہیں | no |
| `head.t.none.next` | Nothing needs your review right now. | ابھی کسی چیز کی جانچ باقی نہیں۔ | no |
| `head.t.approved` | Areeba approved Version {version} | Areeba کی منظوری: ورژن {version} | no |
| `head.t.approved.next` | Shayan now sees only this version. | اب Shayan کو صرف یہی ورژن نظر آتا ہے۔ | no |
| `head.t.rejected` | Areeba kept her original design | Areeba نے اصل ڈیزائن رکھا | no |
| `head.t.rejected.next` | Version {version} stays current. Nothing changes for Shayan. | ورژن {version} ہی موجودہ ہے۔ Shayan کے لیے کچھ نہیں بدلا۔ | no |
| `head.t.replied` | Areeba replied to your question | Areeba کا جواب آ گیا | no |
| `head.t.new` | New change request: needs your review | تبدیلی کی نئی درخواست: آپ کی جانچ چاہیے | no |
| `head.t.new.next` | Read what the customer wants, then send your review. | دیکھیں گاہک کو کیا چاہیے، پھر اپنا جواب بھیجیں۔ | no |
| `head.t.asked` | Question sent: waiting for Areeba | سوال بھیج دیا: Areeba کا انتظار ہے | no |
| `head.t.asked.next` | Production stays on the approved version until she answers. | جواب آنے تک سلائی منظور شدہ ورژن پر ہی رہے گی۔ | no |
| `head.t.reviewed` | Review sent: waiting for Areeba | جواب بھیج دیا: Areeba کا انتظار ہے | no |
| `head.t.reviewed.next` | The request stays open until she approves or keeps her original. | منظوری یا اصل ڈیزائن رکھنے کے فیصلے تک درخواست کھلی رہے گی۔ | no |
| `head.w.finished` | Finished | مکمل | no |
| `head.w.finished.next` | Version {version} is done. Master Mahad has been told. | ورژن {version} تیار ہے۔ ماسٹر مہاد کو بتا دیا گیا ہے۔ | no |
| `head.w.paused` | On hold: problem reported | کام رکا ہوا: مسئلہ بتایا گیا ہے | no |
| `head.w.paused.next` | Do not stitch the affected part. Wait for Master Mahad to reply. | متاثرہ حصہ نہ سلائیں۔ ماسٹر مہاد کے جواب کا انتظار کریں۔ | no |
| `head.w.stitching` | Stitching in progress | سلائی جاری ہے | no |
| `head.w.stitching.next` | Work from Version {version} only. | صرف ورژن {version} کے مطابق کام کریں۔ | no |
| `head.w.pending` | A change is waiting: hold stitching | تبدیلی زیرِ غور ہے: سلائی روکیں | no |
| `head.w.pending.next` | Wait for the customer’s decision. The approved version has not changed. | گاہک کے فیصلے کا انتظار کریں۔ منظور شدہ ورژن نہیں بدلا۔ | no |
| `head.w.current` | Version {version} is current | ورژن {version} موجودہ ہے | no |
| `head.w.current.next` | Read the final instructions, confirm, then start stitching. | آخری ہدایات پڑھیں، تصدیق کریں، پھر سلائی شروع کریں۔ | no |
| `head.c.stitching` | Your agreed design is being stitched | آپ کا طے شدہ ڈیزائن سلا جا رہا ہے | no |
| `head.c.stitching.next` | {design} (Version {version}). | {design} (ورژن {version})۔ | no |
| `head.c.agreed` | Your agreed design | آپ کا طے شدہ ڈیزائن | no |
| `head.c.agreed.next` | {design} (Version {version}). Your tailor must agree before anything changes. | {design} (ورژن {version})۔ کسی بھی تبدیلی کے لیے درزی کی رضامندی ضروری ہے۔ | no |
| `head.c.updated` | Your agreed design is updated | آپ کا طے شدہ ڈیزائن بدل گیا ہے | no |
| `head.c.updated.next` | {design}. This is Version {version}; Version {old} was replaced. | {design}۔ یہ ورژن {version} ہے؛ ورژن {old} بدل دیا گیا۔ | no |
| `head.c.unchanged` | Your agreed design is unchanged | آپ کا طے شدہ ڈیزائن ویسا ہی ہے | no |
| `head.c.unchanged.next` | {design} (Version {version}). | {design} (ورژن {version})۔ | no |
| `head.c.waiting` | Waiting for Master Mahad | ماسٹر مہاد کا انتظار ہے | no |
| `head.c.waiting.next` | Your agreed design (Version {version}) stays the same. Nothing is stitched from your request until you both agree. | آپ کا طے شدہ ڈیزائن (ورژن {version}) ویسا ہی رہے گا۔ دونوں کے راضی ہونے تک آپ کی درخواست پر سلائی نہیں ہوگی۔ | no |
| `head.c.question` | Master Mahad has a question | ماسٹر مہاد کا ایک سوال ہے | no |
| `head.c.question.next` | Answer it so he can finish the review. | جواب دیں تاکہ جانچ مکمل ہو سکے۔ | no |
| `head.c.impossible` | Master Mahad can’t make that. Choose an option | ماسٹر مہاد یہ نہیں بنا سکتے۔ ایک انتخاب کریں | no |
| `head.c.impossible.next` | He suggests another design that works on your cut fabric. | انہوں نے دوسرا ڈیزائن تجویز کیا ہے جو آپ کے کٹے کپڑے پر بن سکتا ہے۔ | no |
| `head.c.possible` | Master Mahad can make it. Choose an option | ماسٹر مہاد یہ بنا سکتے ہیں۔ ایک انتخاب کریں | no |
| `head.c.possible.next` | Approve it, or keep your original design. | اسے منظور کریں، یا اپنا اصل ڈیزائن رکھیں۔ | no |
| `notice.question` | Assalam o Alaikum Areeba, Master Mahad has a question about your {part} change: {reason} Please reply in StitchSure. | السلام علیکم Areeba، {part} کی تبدیلی کے بارے میں ماسٹر مہاد کا سوال ہے: {reason} براہِ کرم StitchSure میں جواب دیں۔ | no |
| `notice.possible` | Assalam o Alaikum Areeba, good news: {style} can be made. {cost}, {date}. Please open StitchSure to approve. | السلام علیکم Areeba، خوشخبری: {style} بن سکتا ہے۔ {cost}، {date}۔ منظوری کے لیے StitchSure کھولیں۔ | no |
| `notice.impossible` | Assalam o Alaikum Areeba, Master Mahad reviewed your {part} change. {style} can’t be made{why}. He suggests {alternative} ({cost}, {date}). Please open StitchSure to approve it or keep your original. | السلام علیکم Areeba، ماسٹر مہاد نے {part} کی تبدیلی دیکھ لی ہے۔ {style} نہیں بن سکتا{why}۔ ان کی تجویز: {alternative} ({cost}، {date})۔ منظور کرنے یا اصل ڈیزائن رکھنے کے لیے StitchSure کھولیں۔ | no |
| `notice.why` | : {reason} | : {reason} | no |
| `skip` | Skip to main content | اصل مواد پر جائیں | no |
| `text.more` | Show more | مزید دکھائیں | no |
| `text.less` | Show less | کم دکھائیں | no |
| `form.selected` | {part} selected. | {part} منتخب ہو گیا۔ | no |
| `form.count` | {count} of {limit} characters | {limit} میں سے {count} حروف | no |
| `status.Cancelled` | Cancelled | منسوخ | no |
| `tailor.problem.reply` | Your reply to Shayan | Shayan کو آپ کا جواب | no |
| `tailor.problem.replyHelp` | Write a reply to turn on the button. Shayan will see it. | بٹن چلانے کے لیے جواب لکھیں۔ Shayan اسے دیکھ سکے گا۔ | no |
| `worker.reply` | Master Mahad replied: “{reply}” | ماسٹر مہاد کا جواب: “{reply}” | no |
| `detail.since` | Customer since {year} · 3 earlier orders | {year} سے گاہک · 3 پرانے آرڈر | no |
| `nav.deliveredOn` | Delivered {date} | {date} کو حوالے کیا | no |
| `part.Length` | Length (lambai) | لمبائی | no |
| `part.Pocket` | Pocket (jeb) | جیب | no |
| `part.Other` | Other | کچھ اور | no |
| `form.other.hint` | Anything else you want changed | کوئی اور تبدیلی جو آپ چاہتے ہیں | no |
| `form.note.Length` | e.g. two inches longer | مثلاً دو انچ لمبا | no |
| `form.note.Pocket` | e.g. one pocket on the right | مثلاً دائیں طرف ایک جیب | no |
| `form.note.Other` | e.g. add buttons on the front | مثلاً سامنے بٹن لگائیں | no |
| `style.hint.Half sleeve` | Ends above the elbow | کہنی سے اوپر تک | no |
| `style.hint.Three-quarter sleeve` | Ends between elbow and wrist | کہنی اور کلائی کے درمیان تک | no |
| `style.hint.Puff sleeve` | Short and gathered at the shoulder | چھوٹی، کندھے پر پھولی ہوئی | no |
| `style.hint.Sleeveless` | No sleeves | بغیر آستین | no |
| `style.hint.Square neckline` | Straight edges | سیدھے کنارے | no |
| `style.hint.Deep round neckline` | Lower round opening | نیچے تک گول | no |
| `style.hint.Band collar` | Short standing collar | چھوٹا کھڑا کالر | no |
| `style.hint.Standard length` | Usual kurta length | کرتے کی عام لمبائی | no |
| `style.hint.Short length` | Ends higher | اونچا دامن | no |
| `style.hint.Long length` | Ends lower | نیچا دامن | no |
| `style.hint.No pocket` | Plain, no pocket | سادہ، بغیر جیب | no |
| `style.hint.Side pocket` | In the side seams | سائیڈ کی سلائی میں | no |
| `style.hint.Front pocket` | On the chest | سینے پر | no |
| `term.Length` | Length | لمبائی | no |
| `term.Pocket` | Pocket | جیب | no |
| `term.Half sleeve` | Half sleeve | آدھی آستین | no |
| `term.Three-quarter sleeve` | Three-quarter sleeve | پون آستین | no |
| `term.Puff sleeve` | Puff sleeve | پف آستین | no |
| `term.Sleeveless` | Sleeveless | بغیر آستین | no |
| `term.Square neckline` | Square neckline | چوکور گلا | no |
| `term.Deep round neckline` | Deep round neckline | گہرا گول گلا | no |
| `term.Band collar` | Band collar | بین کالر | no |
| `term.Standard length` | Standard length | عام لمبائی | no |
| `term.Short length` | Short length | چھوٹی لمبائی | no |
| `term.Long length` | Long length | زیادہ لمبائی | no |
| `term.No pocket` | No pocket | کوئی جیب نہیں | no |
| `term.Side pocket` | Side pocket | سائیڈ جیب | no |
| `term.Front pocket` | Front pocket | سامنے کی جیب | no |
| `term.Nothing extra` | Nothing extra | کوئی اضافی چیز نہیں | no |
| `part.Trouser` | Trouser (shalwar) | ٹراؤزر / شلوار | no |
| `garment.hotspot.Length` | Length | لمبائی | no |
| `garment.hotspot.Pocket` | Pocket | جیب | no |
| `garment.hotspot.Trouser` | Trouser | ٹراؤزر | no |
| `form.note.Trouser` | e.g. a little narrower at the ankle | مثلاً ٹخنے سے تھوڑا تنگ | no |
| `style.hint.Straight trouser` | Plain, straight legs | سادہ سیدھا ٹراؤزر | no |
| `style.hint.Shalwar` | Loose, gathered at the ankle | ڈھیلی، ٹخنے پر تنگ | no |
| `style.hint.Cigarette trouser` | Narrow, ends above the ankle | تنگ، ٹخنے سے اوپر تک | no |
| `style.hint.Wide-leg trouser` | Wide at the bottom | نیچے سے کھلا | no |
| `style.hint.Churidar` | Tight, with folds at the ankle | تنگ، ٹخنے پر چوڑیاں | no |
| `term.Trouser` | Trouser | ٹراؤزر | no |
| `term.Straight trouser` | Straight trouser | سیدھا ٹراؤزر | no |
| `term.Shalwar` | Shalwar | شلوار | no |
| `term.Cigarette trouser` | Cigarette trouser | سگریٹ ٹراؤزر | no |
| `term.Wide-leg trouser` | Wide-leg trouser | کھلے پائنچے والا ٹراؤزر | no |
| `term.Churidar` | Churidar | چوڑی دار پاجامہ | no |
| `form.q.other` | What do you want changed? | آپ کیا بدلنا چاہتے ہیں؟ | no |
| `form.needNoteNext` | Write what you want to turn on Next. | آگے بڑھنے کے لیے لکھیں کہ آپ کو کیا چاہیے۔ | no |
| `order.more` | More details | مزید تفصیل | no |
| `order.history` | Progress and history | کام کی حالت اور پرانا ریکارڈ | no |
| `form.before` | Before | پہلے | no |
| `form.wanted` | What you want | آپ کو یہ چاہیے | no |
| `back.go` | Go back | واپس جائیں | no |
| `home.change.waiting` | A request is already waiting. Open it to answer or cancel it first. | ایک درخواست پہلے ہی انتظار میں ہے۔ پہلے اسے کھول کر جواب دیں یا منسوخ کریں۔ | no |
| `home.request.help` | See the request that is waiting | انتظار میں پڑی درخواست دیکھیں | no |
