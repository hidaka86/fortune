/* MYOURISCOPE — English data overrides.
   このファイルは英語表示のときだけ index.html から読み込まれる(I18N.en 判定)。
   data.js が定義したオブジェクトの「表示用フィールド」だけを英語に差し替える。
   キーとして使われる name / rank / element 等には触れないこと(docs/I18N.md 参照)。 */

/* ===== data.en.js (part 1) — ZODIAC / ETO / KYUSEI / TAROT / TAROT_THEMES ===== */
/* English display-text mutations. Loaded only when I18N.en is true. Keys are never touched. */

/* ---------- ZODIAC (order as in data.js: Capricorn first) ---------- */
ZODIAC[0].keyword = "The Steadfast Achiever";
ZODIAC[0].trait = "A practical worker who builds toward goals one steady step at a time. Your strong sense of responsibility earns deep trust from those around you — though you can be harder on yourself than you need to be.";
ZODIAC[1].keyword = "The Free-Spirited Innovator";
ZODIAC[1].trait = "A reformer with original ideas and a wide view of the world. Untethered to convention, you have a gift for creating new ways of seeing things. You dislike being tied down and value moving at your own pace.";
ZODIAC[2].keyword = "The Empathic Artist";
ZODIAC[2].trait = "A romantic with rich sensitivity and imagination. The kindness with which you stay close to other people's feelings is your greatest charm — though it can leave you easily swept along by those around you.";
ZODIAC[3].keyword = "The Passionate Pioneer";
ZODIAC[3].trait = "An energetic trailblazer who acts the moment inspiration strikes. For decisiveness and speed, no sign in the zodiac matches you. Pausing for one breath before you charge lets that power land even better.";
ZODIAC[4].keyword = "The Aesthete of the Senses";
ZODIAC[4].trait = "You have an eye for what is beautiful and what feels right. Once you decide on something, you see it through to the end — a persistence that builds steady, lasting trust.";
ZODIAC[5].keyword = "The Messenger of Ideas";
ZODIAC[5].trait = "Endlessly curious, and a natural at gathering information and connecting with people. Quick-thinking, you find yourself at the center of conversation wherever you go. What looks like a short attention span is really the ability to switch gears fast.";
ZODIAC[6].keyword = "The Nurturing Guardian";
ZODIAC[6].trait = "Deeply affectionate, you protect the people closest to you with care. Your empathy and memory make you the emotional anchor of any team. To those you truly trust, you give everything you have.";
ZODIAC[7].keyword = "The Radiant Leader";
ZODIAC[7].trait = "Born for the leading role. Your confident presence and generosity toward others draw people to you naturally. Praise fuels you — though a wounded pride can hit harder than you let on.";
ZODIAC[8].keyword = "The Meticulous Analyst";
ZODIAC[8].trait = "You have a sharp eye for detail and the practical skill to match — prized as the one who always notices. The key is not slipping into perfectionism: letting 80 percent be good enough gives you room to breathe.";
ZODIAC[9].keyword = "The Graceful Balancer";
ZODIAC[9].trait = "Refined social grace and a fair sense of balance are your strengths. You can get along smoothly with anyone — though deciding can be the hard part. Practice trusting your intuition.";
ZODIAC[10].keyword = "The Explorer of the Depths";
ZODIAC[10].trait = "You see through to the heart of things, with a passion that pours itself into a single point. You may not say much, but the will you carry inside is unbreakable. The bonds you form with those you trust last a lifetime.";
ZODIAC[11].keyword = "The Adventuring Philosopher";
ZODIAC[11].trait = "An optimist who roams far in search of freedom and growth. Both your reach and the scale of your thinking are wide, and you give the people around you a forward-looking energy. Fine-grained admin is not quite your favorite thing.";

/* ---------- ETO (Chinese zodiac) ---------- */
ETO[0].animal = "Rat";
ETO[0].trait = "Quick-witted, adaptable, and hardworking. You have a real talent for building connections.";
ETO[1].animal = "Ox";
ETO[1].trait = "You move forward steadily, with real staying power. Your strength is the sincerity that never abandons what it starts.";
ETO[2].animal = "Tiger";
ETO[2].trait = "A strong sense of justice and remarkable drive. You lead from the front and pull others along with you.";
ETO[3].animal = "Rabbit";
ETO[3].trait = "Gentle and charming, you soften the mood of any room. A peacemaker who steers clear of conflict.";
ETO[4].animal = "Dragon";
ETO[4].trait = "A passionate soul chasing dreams on a grand scale. You have natural charisma, and you rise to the decisive moment.";
ETO[5].animal = "Snake";
ETO[5].trait = "Deeply inquisitive, with an artisan's devotion to mastering one path. Your intuition is the sharpest of all twelve signs.";
ETO[6].animal = "Horse";
ETO[6].trait = "Bright, open, and well liked. Light on your feet, you have a knack for catching opportunities as they pass.";
ETO[7].animal = "Goat";
ETO[7].trait = "Calm and full of consideration, you are the one who brings people into accord. In any group, trust gathers around you.";
ETO[8].animal = "Monkey";
ETO[8].trait = "Clever hands, a quick mind, and no shortage of ideas. Your humor draws people in.";
ETO[9].animal = "Rooster";
ETO[9].trait = "A perfectionist with foresight and style. You are skilled with your hands and have a fine aesthetic sense.";
ETO[10].animal = "Dog";
ETO[10].trait = "Loyal, dutiful, and hardworking. Once you believe in someone, you support them all the way — a sincerity that is your greatest charm.";
ETO[11].animal = "Boar";
ETO[11].trait = "Pure-hearted, with a passion that runs straight ahead. Once you set a goal, no one can match your focus.";

/* ---------- KYUSEI (Nine Star Ki) ---------- */
KYUSEI[0].trait = "Flexible and a good listener. Like water, you settle into any environment and keep relationships flowing smoothly. Hardship becomes your nourishment — a late bloomer who grows into something great.";
KYUSEI[1].trait = "You hold people the way the earth holds everything — with quiet, generous strength. Supporting others from behind the scenes, the effort you build up steadily bears fruit in your later years.";
KYUSEI[2].trait = "Lightning-quick reflexes and a youthful energy define you. Your luck opens when you take on something new. Fast, decisive calls are your signature.";
KYUSEI[3].trait = "A sociable spirit, refreshing as a breeze. Under this star, trust and connections become your fortune — good luck arrives through distant ties and introductions passed from hand to hand.";
KYUSEI[4].trait = "The sovereign star at the center of the nine. With strong will and presence, no one comes back from adversity like you do. The sheer size of your spirit draws people in.";
KYUSEI[5].trait = "A star that stands for the heavens, marked by responsibility and high pride. Your drive toward perfection is the making of a leader, and you tend to be favored and lifted by those above you.";
KYUSEI[6].trait = "The star of pleasure and good company. A gifted talker with a natural charm that lifts any gathering. Money luck tends to find you — abundance is drawn your way.";
KYUSEI[7].trait = "A star that stands for the mountain, carrying the luck of change and inheritance. You balance continuity and reform with rare skill, and at turning points you leap far.";
KYUSEI[8].trait = "Radiant and intuitive, like the sun. With a fine aesthetic sense and foresight, you shine wherever attention gathers. As long as the fire of your passion keeps burning, your fortune keeps rising.";

/* ---------- TAROT (22 major arcana) ---------- */
TAROT[0].up = "A new journey is beginning. An undecided future is proof that you are free to go anywhere. Stay light, just as you are, and take the first step.";
TAROT[0].rev = "You are about to run on momentum alone. Somewhere inside, you already sense you may not be ready. Set things in order once, and this challenge becomes the real thing.";
TAROT[0].advice = "Traveling light is your advantage — don't wait for perfect preparation, just take the first step.";

TAROT[1].up = "The power to begin is at its fullest. You already have the tools and the talent. All that's left is to combine them and give them shape.";
TAROT[1].rev = "If you feel like you're spinning your wheels, it's because your drive is real. What's missing isn't ability — only a plan. Sketch the blueprint, and things will move all at once.";
TAROT[1].advice = "You already have every tool you need — it's time to give it shape, with confidence.";

TAROT[2].up = "Your intuition is running clear. Your quiet insight goes deeper than anyone's around you. It's safe to choose by the voice of your heart.";
TAROT[2].rev = "Overthinking has you standing still. Carefulness is a strength — right now the fear of failing simply has the upper hand. Sixty percent certainty is enough to move on.";
TAROT[2].advice = "The answer is inside, not out there — take some quiet time and listen to your intuition.";

TAROT[3].up = "It's time to receive the harvest. The love you have poured out is circling back to you, as it should. Take it without holding back.";
TAROT[3].rev = "You have given too much and grown a little tired. Your kindness is real — it's just that giving without return has left your heart running dry. Start by filling your own cup.";
TAROT[3].advice = "Ease off the effort and give yourself permission to receive — abundance comes around.";

TAROT[4].up = "It's time to take the lead. The more responsibility you accept, the larger you stand. You are allowed to decide with confidence.";
TAROT[4].rev = "Part of you has already noticed you're becoming controlling. At the root of that strength is worry. The courage to hand things over is what real leadership looks like.";
TAROT[4].advice = "Being ready to carry responsibility is what moves your luck — take command openly.";

TAROT[5].up = "The proven path is on your side. Sincerity and consistency are the source of the trust you have earned. Borrow the wisdom of those who came before, and a shortcut appears.";
TAROT[5].rev = "Convention has started to feel suffocating. That voice saying “this is how it should be” is really your own strictness. You are allowed to write an answer of your own.";
TAROT[5].advice = "Talk to someone you trust — the wisdom of those before you points to the shortcut.";

TAROT[6].up = "The choice that makes your heart lift is the right one now. The instinct that says “this is fun” is more accurate than logic. Pick the option that excites you.";
TAROT[6].rev = "The hesitation has gone on a while. You can't choose because losing either one frightens you. The moment you accept the loss, what you truly want comes into view.";
TAROT[6].advice = "It's okay to choose what makes your heart flutter — joy is a sign you're right.";

TAROT[7].up = "This is a time to press forward. Your decisiveness and speed are at their peak. Hesitation would only waste them — go.";
TAROT[7].rev = "You're pressing the accelerator too hard. Under the hurry is a fear of being left behind. Take one breath — your momentum won't disappear.";
TAROT[7].advice = "Time spent hesitating is time wasted — if you're going to hit the accelerator, it's now.";

TAROT[8].up = "Your quiet strength is showing. Not force, but your supple, patient way of holding on is what moves the situation. Trust it and keep going.";
TAROT[8].rev = "Are you straining to look strong? Swallowing your worries is the flip side of your kindness. Leaning on someone is a kind of strength too.";
TAROT[8].advice = "Not by force, but with suppleness — your calm inner strength is what moves things.";

TAROT[9].up = "This is a time to go deeper. Time alone doesn't dull you — it sharpens you. The answer is waiting in the quiet.";
TAROT[9].rev = "You have withdrawn so far that your view is narrowing. Being alone truly is easier — but the loneliness is real too. Open the door to just one person you trust.";
TAROT[9].advice = "Time alone will give you the answer — go deeper at your own pace, without hurry.";

TAROT[10].up = "The current is turning. The chance coming around isn't coincidence — your preparation called it here. Take it without hesitating.";
TAROT[10].rev = "The timing isn't quite meshing right now. The impatience is understandable, but this isn't a standstill — it's a running start. The next wave will come.";
TAROT[10].advice = "The current is about to turn — when the chance arrives, take it without hesitation.";

TAROT[11].up = "Sincerity is being repaid. The judgment you have kept honest all along is sound. Make your case openly, grounded in the facts.";
TAROT[11].rev = "Have you been swallowing a sense of unfairness? Patience is a virtue, but a scale left tilted wears the heart down. You are allowed to say it — calmly, and clearly.";
TAROT[11].advice = "Judge by facts, not feelings — sincerity brings the best outcome.";

TAROT[12].up = "It's time to change your vantage point. This stretch of stillness is preparing you to see a new view. Look at it upside down, and the answer is there.";
TAROT[12].rev = "Your patience has gone unrewarded for a while. The sincerity that endures, trusting you'll be understood someday, is real. But changing your approach is not the same as running away.";
TAROT[12].advice = "A time when you can't move is a chance to change perspective — seen upside down, the answer appears.";

TAROT[13].up = "This is a closing chapter. You have the courage to accept an ending. Only a hand that has let go can take hold of something new.";
TAROT[13].rev = "Lingering attachment has stopped your feet. Not being able to forget is proof of how much it mattered. But each time you look back a little less, the strength to move forward returns.";
TAROT[13].advice = "An ending is the signal of a beginning — letting go makes room for something new.";

TAROT[14].up = "A time of harmony. Your refusal to swing to extremes steadies everyone around you. That just-right balance is your greatest strength.";
TAROT[14].rev = "Your daily rhythm has been slipping. When you know it but can't stop, the answer is to change your surroundings, not your willpower. Put just one thing in order.";
TAROT[14].advice = "Avoid the extremes and find the balance you can hold — a sustainable pace is the key.";

TAROT[15].up = "Desire becomes energy now. The honesty to admit “I want this” is fuel for action. Just keep the reins in your own hands.";
TAROT[15].rev = "The time to cut loose has come. Deep down, you know the chain of that stubborn habit is one you can unfasten yourself. Decide today, and you're free today.";
TAROT[15].advice = "Take a fresh look at the habits you keep “just because” — the chain is one you can unfasten yourself.";

TAROT[16].up = "The lightning of change is striking. What breaks is only the old shape that had finished its work. On cleared ground, you can rebuild with only what truly matters.";
TAROT[16].rev = "Small cracks are showing. Wanting to look away is natural, but the sooner the repair, the smaller the scar. There is still time now.";
TAROT[16].advice = "The unexpected breaks old structures to show you what truly matters.";

TAROT[17].up = "A time of hope. If you can put a wish into words, you also carry the power to fulfill it. Raise your ideal without embarrassment.";
TAROT[17].rev = "The distance between the ideal and the real has worn you out. You haven't lost the ability to dream. Cut the goal in half, and you can start walking again.";
TAROT[17].advice = "Put your wish into words — the path lights up only for those who keep hoping.";

TAROT[18].up = "A time for intuition. Even inside an unease you can't quite see through, your ability to sense things holds true. Don't rush — go only as far as the moonlight shows.";
TAROT[18].rev = "The fog is lifting. The worry you have been carrying turns out to be smaller than you thought. Misunderstandings dissolve, and the truth comes into view.";
TAROT[18].advice = "Your unease is only something you can't see yet — don't force a conclusion, wait for morning.";

TAROT[19].up = "Your time to shine. Your effort has borne fruit too plainly to hide. Be glad without reserve, and accept it with your head held high.";
TAROT[19].rev = "You are one step from done. At ninety percent, your focus has relaxed a little — that's all. Carry the same care through the final touches, and it will be complete.";
TAROT[19].advice = "The best tailwind is behind you — enjoy it openly, and let yourself shine.";

TAROT[20].up = "A time of renewal. You have earned the right to reach again for what you once gave up. Everything you have been through is on your side.";
TAROT[20].rev = "The past is pulling at you. Regret lingers because you were serious. But you get to choose which pages to reread. Start writing the next chapter.";
TAROT[20].advice = "If you're going to retry what you once gave up on, it's now — none of that experience was wasted.";

TAROT[21].up = "A time of completion. A long journey bears its fruit. Take a moment to savor it — the next door is already in view.";
TAROT[21].rev = "It's unfinished by just one step. The persistence that carried you this far is real, and the missing piece is smaller than you think. Focus on that final touch.";
TAROT[21].advice = "One cycle is nearing completion — finish it with care, then on to the next journey.";

/* ---------- TAROT_THEMES (love / work / money × upright / reversed) ---------- */
TAROT_THEMES[0].love.up = "A free, unencumbered love is beginning. When a new encounter comes, dive in.";
TAROT_THEMES[0].love.rev = "Watch for a rushed start or a flighty connection. Get to know them a little more first.";
TAROT_THEMES[0].work.up = "A perfect moment for new work, a career move, or trying something you've never done. Traveling light is your advantage.";
TAROT_THEMES[0].work.rev = "Are you setting off underprepared? Try writing the plan down once.";
TAROT_THEMES[0].money.up = "A seed of new income is sprouting. Starting small is the way.";
TAROT_THEMES[0].money.rev = "Unplanned spending is piling up. Tighten the purse strings for a while.";

TAROT_THEMES[1].love.up = "A good moment to make a move. Conversation and humor are what tie this bond — reach out first.";
TAROT_THEMES[1].love.rev = "Beware of someone who is all talk. Judge by actions, not words.";
TAROT_THEMES[1].work.up = "Planning, negotiating and presenting all run sharp. Show your skills with confidence.";
TAROT_THEMES[1].work.rev = "Signs of spinning your wheels. Firm up your evidence and preparation before you make your move.";
TAROT_THEMES[1].money.up = "A chance for your talent and skills to turn into money. A good day for a first step into a side project, too.";
TAROT_THEMES[1].money.rev = "If it sounds too good to be true, doubt it first. Read every corner of the contract.";

TAROT_THEMES[2].love.up = "Take your time and look closely. A quiet opening for a deeper connection of heart and mind.";
TAROT_THEMES[2].love.rev = "Has suspicion crept in? An honest conversation will do more than more thinking.";
TAROT_THEMES[2].work.up = "Analysis, research and groundwork pay off now. Knowledge is your edge.";
TAROT_THEMES[2].work.rev = "Too much critique is opening distance around you. Add a spoonful of softness.";
TAROT_THEMES[2].money.up = "Steady management is favored. A fine time to review your budget and assets.";
TAROT_THEMES[2].money.rev = "Penny-pinching is becoming its own stress. Save firmly, spend deliberately.";

TAROT_THEMES[3].love.up = "A season of being loved. This love ripens with you just as you are — don't be afraid to receive it.";
TAROT_THEMES[3].love.rev = "You may be slipping into passivity, or leaning a little too hard. Keep time that is yours alone.";
TAROT_THEMES[3].work.up = "A harvest season — the effort you have built up takes shape. Your team is on your side, too.";
TAROT_THEMES[3].work.rev = "Loose ends and lapses slip in easily now. Be most careful at the finish.";
TAROT_THEMES[3].money.up = "Abundance is coming around. A windfall or a gift may find you.";
TAROT_THEMES[3].money.rev = "Watch out for spending for show, and one too many self-rewards.";

TAROT_THEMES[4].love.up = "A tie with someone sincere and dependable. This is heading toward a steady, future-minded relationship.";
TAROT_THEMES[4].love.rev = "Control, or a contest of stubbornness, may be creeping in. Remember you are equals.";
TAROT_THEMES[4].work.up = "Promotion, or a position of responsibility, is indicated. Take command openly.";
TAROT_THEMES[4].work.rev = "Going it alone is starting to draw pushback. Listen to the voices around you.";
TAROT_THEMES[4].money.up = "Good for stable income and building assets. Time to draw up the long-term plan.";
TAROT_THEMES[4].money.rev = "Take one breath before any forceful investment or big purchase.";

TAROT_THEMES[5].love.up = "A sincere bond you could imagine marrying into. Introductions, especially from elders, are favored.";
TAROT_THEMES[5].love.rev = "Convention and appearances are holding too much sway. Talk about what's right for the two of you.";
TAROT_THEMES[5].work.up = "Support from above is with you. Doing things by the book earns recognition now.";
TAROT_THEMES[5].work.rev = "Precedent has become a shackle. Ask once: “is this really the way?”";
TAROT_THEMES[5].money.up = "Following the advice of someone you trust is favored. The classic way of saving is the right one.";
TAROT_THEMES[5].money.rev = "Don't take authority or advertising at face value. Get a second quote.";

TAROT_THEMES[6].love.up = "Signs the feeling is mutual. One delightful date could move things forward all at once.";
TAROT_THEMES[6].love.rev = "Crossed signals, or the shadow of temptation. Tidy up anything left ambiguous.";
TAROT_THEMES[6].work.up = "A time blessed with good partnerships. The choice you can enjoy is the right one.";
TAROT_THEMES[6].work.rev = "Postponing the choice is costing you chances. Set a deadline and decide.";
TAROT_THEMES[6].money.up = "Spending on joy lifts your luck. Just keep any shared finances clear and open.";
TAROT_THEMES[6].money.rev = "Temptation buys and social spending are piling up. Find the courage to decline.";

TAROT_THEMES[7].love.up = "A bold approach pays off. This love moves fast — act rather than hesitate.";
TAROT_THEMES[7].love.rev = "Pushing hard is backfiring. Have you left their pace behind?";
TAROT_THEMES[7].work.up = "This is the decisive moment. Boldness and speed bring the win.";
TAROT_THEMES[7].work.rev = "Watch for overrunning and jumping the gun. Groundwork and double-checks come first.";
TAROT_THEMES[7].money.up = "Action converts straight into gain now. When the chance shows, decide on the spot.";
TAROT_THEMES[7].money.rev = "Beware hasty deals and buying at the peak. Play defense today.";

TAROT_THEMES[8].love.up = "A bond of deep trust is forming. Patient, persistent affection bears fruit.";
TAROT_THEMES[8].love.rev = "Are you bending yourself out of shape to fit? Take care of the unvarnished you.";
TAROT_THEMES[8].work.up = "You can carry the difficult assignment through. Patience and nerve are what get recognized.";
TAROT_THEMES[8].work.rev = "Brute force won't do it. Rest counts as part of the work.";
TAROT_THEMES[8].money.up = "Steady, patient saving wins now. Trust the power of continuing.";
TAROT_THEMES[8].money.rev = "You've been stretching the budget too thin. Start the review with your fixed costs.";

TAROT_THEMES[9].love.up = "A love that learns each other's inner world slowly is favored. The long way around is the fast way now.";
TAROT_THEMES[9].love.rev = "You've drawn too far into your shell. Don't run from the places where meetings happen.";
TAROT_THEMES[9].work.up = "A fine chance to sharpen your expertise. Solitary, focused work goes well.";
TAROT_THEMES[9].work.rev = "Signs of carrying too much alone. Talk to someone you trust.";
TAROT_THEMES[9].money.up = "Good for saving, and for investing in yourself — learning included. Money grows quietly now.";
TAROT_THEMES[9].money.rev = "Being too tight-fisted lets luck slip away too. Pay the necessary costs gladly.";

TAROT_THEMES[10].love.up = "A fated meeting, a sudden turn of events — ride the current.";
TAROT_THEMES[10].love.rev = "A season of waiting on timing. Let it ripen rather than force it.";
TAROT_THEMES[10].work.up = "A turning point where the current shifts in your favor. Take hold of what comes around.";
TAROT_THEMES[10].work.rev = "The headwind is temporary. Firm up your footing for the next wave.";
TAROT_THEMES[10].money.up = "A tailwind for your money. Don't let the chance that comes around slip by.";
TAROT_THEMES[10].money.rev = "Avoid anything that amounts to a gamble. Wait for the current to change.";

TAROT_THEMES[11].love.up = "An equal, honest relationship is growing. Clear lines and kept promises deepen the love.";
TAROT_THEMES[11].love.rev = "Has the relationship gone lopsided? Take stock of how much you have been enduring.";
TAROT_THEMES[11].work.up = "Fair judgment comes down now. Good for contracts, negotiations and reviews.";
TAROT_THEMES[11].work.rev = "Meet unfairness calmly, with facts. An emotional battle works against you.";
TAROT_THEMES[11].money.up = "Income and spending are in balance. A good time for contracts and paperwork.";
TAROT_THEMES[11].money.rev = "Watch for trouble around lending and borrowing. Avoid verbal promises about money.";

TAROT_THEMES[12].love.up = "Devotion bears fruit now. The patience you offer for their sake has meaning.";
TAROT_THEMES[12].love.rev = "Has your giving stopped being returned? Don't keep putting yourself last.";
TAROT_THEMES[12].work.up = "The groundwork and behind-the-scenes labor will pay off later. A change of viewpoint opens the way through.";
TAROT_THEMES[12].work.rev = "The sense of wasted effort is building. That's a sign to change the method itself.";
TAROT_THEMES[12].money.up = "This is sowing season. Not expecting an immediate return is the right call.";
TAROT_THEMES[12].money.rev = "Even “lose a little now to gain later” has its limits. Review what you're paying out of pocket.";

TAROT_THEMES[13].love.up = "A time of renewal for the relationship. Release the past, and new love has room to enter.";
TAROT_THEMES[13].love.rev = "Draw a line under lingering feelings and a relationship that only drags on. An ending is the signal of a beginning.";
TAROT_THEMES[13].work.up = "A turning point. Time to let go, decisively, of old methods and old roles.";
TAROT_THEMES[13].work.rev = "Resisting change is what's creating the standstill. Start changing small.";
TAROT_THEMES[13].money.up = "Refreshing the budget and clearing out subscriptions is favored. A reset gets things circulating again.";
TAROT_THEMES[13].money.rev = "Putting off the decision to cut a loss only deepens the wound.";

TAROT_THEMES[14].love.up = "A calm, comfortable relationship. Your values are settling into each other naturally.";
TAROT_THEMES[14].love.rev = "You may be sensing a difference in warmth. Match your stride to their pace.";
TAROT_THEMES[14].work.up = "You shine as the one who brings things into accord. A sustainable pace turns into results.";
TAROT_THEMES[14].work.rev = "Beware of sitting halfway on everything. Narrow your priorities down to one.";
TAROT_THEMES[14].money.up = "Income and spending are steady. A good time to review savings plans and insurance.";
TAROT_THEMES[14].money.rev = "You're swinging between splurging and extreme thrift. Level it out.";

TAROT_THEMES[15].love.up = "A passionate spell, drawn by a pull that's hard to resist. Just take care not to drown in it.";
TAROT_THEMES[15].love.rev = "Time to cut the tie that only binds. Freedom from the attachment makes room for a new one.";
TAROT_THEMES[15].work.up = "Ambition becomes energy now. Make the most of what your current position offers.";
TAROT_THEMES[15].work.rev = "Time to cut bad habits, cozy routines and tangled ties. Every cut you make is ground gained.";
TAROT_THEMES[15].money.up = "Desire drives you forward now. Just draw a firm line around habit-forming spending.";
TAROT_THEMES[15].money.rev = "Time to quit the impulse buys, in-app charges and borrowing. Decide today, and it's done today.";

TAROT_THEMES[16].love.up = "A jolting turn that breaks old assumptions and remakes them. True feelings come out into the open.";
TAROT_THEMES[16].love.rev = "Repair the crack while it's still small. Looking away is what invites the collapse.";
TAROT_THEMES[16].work.up = "Unexpected change is arriving. The fall of the old structure is, in fact, an opening.";
TAROT_THEMES[16].work.rev = "Early signs of trouble. Don't skip the backups and double-checks.";
TAROT_THEMES[16].money.up = "Prepare for a sudden expense. A reserve fund is the heart of your defense.";
TAROT_THEMES[16].money.rev = "A large loss can still be avoided. Review your insurance and contracts now.";

TAROT_THEMES[17].love.up = "A meeting with someone close to your ideal. Light falls on those who kept hoping.";
TAROT_THEMES[17].love.rev = "The ideal may have climbed too high. See the good in what's actually in front of you.";
TAROT_THEMES[17].work.up = "The goal comes into focus and the future opens. Put the vision into words and share it.";
TAROT_THEMES[17].work.rev = "Your projections may be running optimistic. Bring the plan down to real numbers.";
TAROT_THEMES[17].money.up = "Investing in your future — learning, health — is favored. Send an allowance to your future self.";
TAROT_THEMES[17].money.rev = "Beware of dreamy get-rich stories. The shinier the pitch, the more you should verify.";

TAROT_THEMES[18].love.up = "A love that grows even inside uncertainty. Trust the intuition you can't quite put into words.";
TAROT_THEMES[18].love.rev = "Misunderstandings are dissolving. The fog lifts, and their true feelings come into view.";
TAROT_THEMES[18].work.up = "The situation is unclear. Don't lock in a call yet — be thorough with confirmation and groundwork.";
TAROT_THEMES[18].work.rev = "A hidden problem comes to light. Letting it all surface is what starts the cure.";
TAROT_THEMES[18].money.up = "Murky offers and vague contracts are best put on hold.";
TAROT_THEMES[18].money.rev = "Hidden costs come to light now. Check every line of the statement.";

TAROT_THEMES[19].love.up = "Perfect weather for love. Say what you honestly feel, straight out, and it will bloom.";
TAROT_THEMES[19].love.rev = "The only caution is overconfidence. Even so, there is plenty of hope here.";
TAROT_THEMES[19].work.up = "Success, achievement, attention. Your results shine in the light they deserve.";
TAROT_THEMES[19].work.rev = "It's at ninety percent. Stay careful through the very last details.";
TAROT_THEMES[19].money.up = "Your money luck is at its best. Receive openly, spend gladly, and keep it circulating.";
TAROT_THEMES[19].money.rev = "Watch for overspending out of sheer optimism. Keep the celebration modest.";

TAROT_THEMES[20].love.up = "Reunion, or a rekindling, is indicated. A feeling you thought had ended catches light again.";
TAROT_THEMES[20].love.rev = "Ask yourself whether this has become clinging to the past. Choosing to face forward is a form of love too.";
TAROT_THEMES[20].work.up = "A second attempt bears fruit now. Past experience and old connections come alive in unexpected ways.";
TAROT_THEMES[20].work.rev = "Build the guardrails against repeating the old mistake — then try again.";
TAROT_THEMES[20].money.up = "Past investments and effort pay off now. Check on assets that have been sleeping.";
TAROT_THEMES[20].money.rev = "Don't get heated trying to win back what was lost.";

TAROT_THEMES[21].love.up = "Fulfillment, marriage, the finest match. One love is moving toward completion.";
TAROT_THEMES[21].love.rev = "One step from complete. The missing piece is somewhere in the conversation between you.";
TAROT_THEMES[21].work.up = "A project completes; a goal is reached. Begin preparing the next stage, too.";
TAROT_THEMES[21].work.rev = "It has stalled just short of finished. Focus on the one final touch.";
TAROT_THEMES[21].money.up = "The target amount is reached; a sense of enough. Time to set the next goal.";
TAROT_THEMES[21].money.rev = "Watch for a slip in management just before the goal. Stay attentive to the end.";

/* ===== data.en.js (part 2) — English mutations for js/data.js lines 154-463 =====
   Loaded only when English is active. Mutation statements only. */

/* ---------- RITUAL_SPREADS ---------- */
RITUAL_SPREADS.daily.purpose = "What kind of day will today be?";
RITUAL_SPREADS.daily.label = "Today's Card";
RITUAL_SPREADS.daily.desc = "A shorter ritual. Shuffle, and let intuition choose one card.";
RITUAL_SPREADS.daily.positions[0].ja = "For you today";

RITUAL_SPREADS.one.purpose = "The thing in front of you: how will it go?";
RITUAL_SPREADS.one.label = "One Oracle";
RITUAL_SPREADS.one.desc = "A single-card draw. Bring one question, and let the card answer it straight.";
RITUAL_SPREADS.one.positions[0].ja = "The answer";

RITUAL_SPREADS.three.purpose = "Read your past, present and future";
RITUAL_SPREADS.three.label = "Three-Card Spread";
RITUAL_SPREADS.three.desc = "Read the current running from past through present to future.";
RITUAL_SPREADS.three.positions[0].ja = "The past";
RITUAL_SPREADS.three.positions[1].ja = "The present";
RITUAL_SPREADS.three.positions[2].ja = "The future";

RITUAL_SPREADS.celtic.purpose = "A deep, complete look at where things stand";
RITUAL_SPREADS.celtic.label = "Celtic Cross";
RITUAL_SPREADS.celtic.desc = "One question, read from every angle: root causes, the present, what your unconscious is really saying, the people around you, and where it all may lead. The most famous and versatile of the full-scale spreads.";
RITUAL_SPREADS.celtic.positions[0].ja = "You, right now";
RITUAL_SPREADS.celtic.positions[1].ja = "The challenge you face";
RITUAL_SPREADS.celtic.positions[2].ja = "What you're reaching for";
RITUAL_SPREADS.celtic.positions[3].ja = "Your heart's foundation";
RITUAL_SPREADS.celtic.positions[4].ja = "What has passed";
RITUAL_SPREADS.celtic.positions[5].ja = "The near future";
RITUAL_SPREADS.celtic.positions[6].ja = "Where you stand";
RITUAL_SPREADS.celtic.positions[7].ja = "What surrounds you";
RITUAL_SPREADS.celtic.positions[8].ja = "Hopes and fears";
RITUAL_SPREADS.celtic.positions[9].ja = "Where it leads";

RITUAL_SPREADS.night.purpose = "A slow reading, for tonight only";
RITUAL_SPREADS.night.label = "Moon Chamber";
RITUAL_SPREADS.night.desc = "A room that opens only at night. Fold the day quietly closed, and carry one small light toward tomorrow. This is a reading with no need to hurry.";
RITUAL_SPREADS.night.positions[0].ja = "What you can let go of today";
RITUAL_SPREADS.night.positions[1].ja = "What you can only say at night";
RITUAL_SPREADS.night.positions[2].ja = "A light for tomorrow";

RITUAL_SPREADS.newmoon.purpose = "On the new moon, a seed of beginning";
RITUAL_SPREADS.newmoon.label = "New Moon Window";
RITUAL_SPREADS.newmoon.desc = "A window that opens only on the day the moon disappears. Ask one card about what you are ready to start growing.";
RITUAL_SPREADS.newmoon.positions[0].ja = "A card for beginnings";

RITUAL_SPREADS.fullmoon.purpose = "On the full moon, something to release";
RITUAL_SPREADS.fullmoon.label = "Full Moon Window";
RITUAL_SPREADS.fullmoon.desc = "A window that opens only on the day the moon is full. Return one thing you've been carrying too long to the moon.";
RITUAL_SPREADS.fullmoon.positions[0].ja = "A card for letting go";

/* ---------- TAROT_SPREADS ---------- */
TAROT_SPREADS.daily.label = "Today's Fortune";
TAROT_SPREADS.daily.guide = "Close your eyes and take one deep breath. Ask silently, “What kind of day will today be?” — then choose a card on intuition.";
TAROT_SPREADS.daily.spreads[1].ja = ["For you today"];

TAROT_SPREADS.love.label = "Love";
TAROT_SPREADS.love.guide = "Picture their face, or the meeting you hope for. The more specific your question — “where are the two of us heading?” — the more clearly the cards answer.";
TAROT_SPREADS.love.spreads[1].ja = ["For you, right now"];
TAROT_SPREADS.love.spreads[3].ja = ["How you feel", "How they feel", "What lies ahead for you two"];

TAROT_SPREADS.work.label = "Work & Interviews";
TAROT_SPREADS.work.guide = "Bring to mind just one situation: a project, an interview, a career crossroads. The narrower the question, the sharper the answer.";
TAROT_SPREADS.work.spreads[1].ja = ["For you, right now"];
TAROT_SPREADS.work.spreads[3].ja = ["Where things stand", "The obstacle", "Advice"];

TAROT_SPREADS.money.label = "Money";
TAROT_SPREADS.money.guide = "Think of one money matter on your mind — a purchase, an investment, your savings — and choose a card.";
TAROT_SPREADS.money.spreads[1].ja = ["For you, right now"];
TAROT_SPREADS.money.spreads[3].ja = ["Where things stand", "The near future", "A hint for better luck"];

/* ---------- Lucky colors / items / places ---------- */
LUCKY_COLORS.splice(0, LUCKY_COLORS.length,
  "Coral pink", "Lavender", "Turquoise", "Sun yellow", "Forest green", "Royal blue",
  "Pearl white", "Terracotta", "Mint green", "Bordeaux", "Champagne gold", "Smoky gray");
LUCKY_ITEMS.splice(0, LUCKY_ITEMS.length,
  "a handkerchief", "a houseplant", "a wristwatch", "a notebook", "a mug", "earphones",
  "perfume", "a book", "sneakers", "a key case", "a ballpoint pen", "lip balm");
LUCKY_PLACES.splice(0, LUCKY_PLACES.length,
  "a café", "a park", "a bookstore", "the station's east exit", "the waterside", "a high floor",
  "an art museum", "a movie theater", "a shrine", "a market", "a library", "an observation deck");

/* ---------- THEME_LABEL ---------- */
THEME_LABEL.total = "Overall";
THEME_LABEL.love = "Love";
THEME_LABEL.work = "Work";
THEME_LABEL.money = "Money";
THEME_LABEL.health = "Health";

/* ---------- NIKKAN_DESC (symbol / yinyang / text only — element is logic) ---------- */
NIKKAN_DESC["甲"].symbol = "Great Tree";
NIKKAN_DESC["甲"].yinyang = "Yang";
NIKKAN_DESC["甲"].text = "A great tree growing straight toward the sky. You hold up sturdy ideals, and the strength of a core that doesn't easily bend makes you a natural leader others follow.";
NIKKAN_DESC["乙"].symbol = "Wildflower";
NIKKAN_DESC["乙"].yinyang = "Yin";
NIKKAN_DESC["乙"].text = "A supple wildflower. You bend with your surroundings but never break — yours is a quiet tenacity, and a flexible way of moving through the world.";
NIKKAN_DESC["丙"].symbol = "Sun";
NIKKAN_DESC["丙"].yinyang = "Yang";
NIKKAN_DESC["丙"].text = "The sun that shines on everything. Your brightness and unmistakable presence warm every room — you lift people's spirits without even trying.";
NIKKAN_DESC["丁"].symbol = "Lantern";
NIKKAN_DESC["丁"].yinyang = "Yin";
NIKKAN_DESC["丁"].text = "A candle flame lighting the night. A delicate passion burns inside you, and a deep kindness quietly warms the people at your side.";
NIKKAN_DESC["戊"].symbol = "Sacred Peak";
NIKKAN_DESC["戊"].yinyang = "Yang";
NIKKAN_DESC["戊"].text = "A mountain that does not move. Steady and embracing, you grow stronger the more people lean on you — a person built for trust.";
NIKKAN_DESC["己"].symbol = "Field";
NIKKAN_DESC["己"].yinyang = "Yin";
NIKKAN_DESC["己"].text = "A field where life is raised. Caring by nature, you have a producer's gift for spotting the talent in others and helping it grow.";
NIKKAN_DESC["庚"].symbol = "Steel";
NIKKAN_DESC["庚"].yinyang = "Yang";
NIKKAN_DESC["庚"].text = "Steel that grows stronger with every forging. Decisive and quick to act, you show your true worth when the odds are against you.";
NIKKAN_DESC["辛"].symbol = "Jewel";
NIKKAN_DESC["辛"].yinyang = "Yin";
NIKKAN_DESC["辛"].text = "A jewel that shines when polished. With a keen sense of beauty and a quiet pride, your delicate sensibility gives off a light that is yours alone.";
NIKKAN_DESC["壬"].symbol = "Great River";
NIKKAN_DESC["壬"].yinyang = "Yang";
NIKKAN_DESC["壬"].text = "A great river flowing wide and unhurried. Free and large of spirit, you open a path to anywhere with wisdom and momentum.";
NIKKAN_DESC["癸"].symbol = "Gentle Rain";
NIKKAN_DESC["癸"].yinyang = "Yin";
NIKKAN_DESC["癸"].text = "Rain that quietly waters the earth. Soft-spoken and thoughtful, your influence seeps into everything around you before anyone notices — gentle, and certain.";

/* ---------- MOONSIGN_DESC ---------- */
MOONSIGN_DESC["牡羊座"] = "Your heart acts on feeling. There's an impulse in you to move the moment something stirs — and clean, unhesitating decisions are what keep your spirit well.";
MOONSIGN_DESC["牡牛座"] = "Your heart is fed through the senses. Good food, soft textures and trusted favorites restore you more deeply than anything else.";
MOONSIGN_DESC["双子座"] = "Your heart is always hungry for something new. Conversation and curiosity are your steadiest medicine.";
MOONSIGN_DESC["蟹座"] = "A place where you feel safe is the axis of your heart. Once someone counts as family, your attachment runs deep — the wish to protect them is what drives you.";
MOONSIGN_DESC["獅子座"] = "The wish to be seen is your heart's engine. Inside, life is always a little dramatic, and you're looking for a stage where you can shine.";
MOONSIGN_DESC["乙女座"] = "Order calms you. You reach for perfection without noticing it, so letting 80 percent be enough will lighten your heart.";
MOONSIGN_DESC["天秤座"] = "You are your heart's own balancer. You're steadiest when comfortably connected to someone, and beautiful things restore you.";
MOONSIGN_DESC["蠍座"] = "Your feelings burn deep and quiet. Opening up takes time, but the bonds you do form last a lifetime.";
MOONSIGN_DESC["射手座"] = "Your heart is a lifelong traveler. Without the promise of freedom and a little adventure, you start to suffocate — yours is a soul that needs open sky.";
MOONSIGN_DESC["山羊座"] = "A hard worker who tends to put the role before the feeling. In truth, it's your sense of responsibility that holds you up, more than anyone knows.";
MOONSIGN_DESC["水瓶座"] = "Your heart watches the world from one step back. Being yourself, rather than one of the crowd, is what makes you feel safe.";
MOONSIGN_DESC["魚座"] = "Your sensitivity is always switched on, and other people's feelings flow easily into your kind heart. Time alone, to let the waters clear, matters more than you think.";

/* ---------- TSUHENSEI (gloss / day / month only — keys and weights untouched)
   day: first sentence ends with "." (code splits on "." in EN)
   month: exactly one " — " separator (code splits on "— ") ---------- */
TSUHENSEI["比肩"].gloss = "the star of “independence,” sharing your own nature: strength gathers when you move at your own pace, on your own";
TSUHENSEI["比肩"].day = "A day to steer by your own compass. The more you keep your own pace, the more strength you'll find. Perfect for solo work, self-improvement or a good workout.";
TSUHENSEI["比肩"].month = "A “Friend” month — a current of independence and challenge. Results come from quietly working the plan you set yourself, more than from fitting in with others. Compete with yesterday's you, not with the people around you.";

TSUHENSEI["劫財"].gloss = "the star of “solidarity,” bringing allies and momentum: great forward drive, though money tends to slip out with it";
TSUHENSEI["劫財"].day = "A day of momentum and good company. The mood is high, but so is the urge to spend. Save the big purchases for tomorrow.";
TSUHENSEI["劫財"].month = "A “Rob Wealth” month — a current of allies and momentum. Moving as a team carries you further than you'd expect. It's also a month when spending piles up: watch the rounds you buy, the impulse purchases, and any deal that sounds too good.";

TSUHENSEI["食神"].gloss = "the star of “abundance,” ruling comfort, food and play: savoring life is how your luck grows";
TSUHENSEI["食神"].day = "A day for enjoyment. Good food and the things you love will call luck in. Let your shoulders drop.";
TSUHENSEI["食神"].month = "An “Eating God” month — a current of pleasure and harvest. The more carefully you enjoy your everyday comforts, the more your luck grows this month. Fill the calendar with hobbies, creative work and meals with friends. The key is not effort but savoring.";

TSUHENSEI["傷官"].gloss = "the star of “brilliance,” ruling sharp senses and expression: intuition runs keen, but words can grow edges";
TSUHENSEI["傷官"].day = "A day of heightened senses. Words come out sharper than you mean them, so take one breath before you post.";
TSUHENSEI["傷官"].month = "A “Hurting Officer” month — a current of feeling and expression. Your eye and your intuition are sharp this month, which favors making things and putting your work out there. Words can grow thorns, though, so keep them soft with the people who matter.";

TSUHENSEI["偏財"].gloss = "the star of “circulating wealth,” moving with your connections: being quick on your feet draws money and chances your way";
TSUHENSEI["偏財"].day = "A day of circulating wealth. Time with people brings money and chances along with it. Say yes to the invitation.";
TSUHENSEI["偏財"].month = "An “Indirect Wealth” month — a current of connections and circulating wealth. Getting out and about draws money in this month: gatherings, introductions, a windfall arriving through someone you know. Love catches a tailwind too. Gambling, though, is off the table.";

TSUHENSEI["正財"].gloss = "the star of “steady wealth and trust,” built one day at a time: honest effort comes back to you in solid form";
TSUHENSEI["正財"].day = "A day of harvest. Patient work takes visible shape. Good for contracts, savings, or going over the household budget.";
TSUHENSEI["正財"].month = "A “Direct Wealth” month — a current of steady harvest. What you've been building comes back as real numbers and real trust this month. Savings plans, long-term contracts, talks about the future with someone dear: this is the month for them.";

TSUHENSEI["偏官"].gloss = "the star of “the offensive,” ruling drive and nerve: pressure converts straight into forward motion";
TSUHENSEI["偏官"].day = "A day to compete. Pressure turns into power. When you make your move, make it fast.";
TSUHENSEI["偏官"].month = "A “Seven Killings” month — a current of action and contest. Busier than usual, yes, but that is exactly what tempers you and moves how you're seen this month. Take the first move; when in doubt, act. Your body is your capital, though, so don't trade away your sleep.";

TSUHENSEI["正官"].gloss = "the star of “trust,” ruling order and social standing: the straighter you play it, the higher those above you rate you";
TSUHENSEI["正官"].day = "A day of recognition. Sincerity turns into trust. Reports and proposals to your seniors land well today.";
TSUHENSEI["正官"].month = "A “Direct Officer” month — a current of trust and recognition. Responsibility tends to find you this month, and playing it straight raises your standing. A good month for official decisions: a promotion, a qualification, a proposal.";

TSUHENSEI["偏印"].gloss = "the star of “ideas,” ruling flashes of insight and change: seeds of luck lie along the road you don't usually take";
TSUHENSEI["偏印"].day = "A day of inspiration. Ideas arrive on their own. Try walking a different way than usual.";
TSUHENSEI["偏印"].month = "An “Indirect Resource” month — a current of change and fresh ideas. Anything out of the ordinary moves your luck this month: new studies, a side project, a trip. Restlessness comes with it, so let any decision to quit rest until the month is out.";

TSUHENSEI["印綬"].gloss = "the star of “storing up,” ruling wisdom and learning: what you take in, and how you rest, become tomorrow's strength";
TSUHENSEI["印綬"].day = "A day for learning. You absorb everything easily right now. Reading, study, and advice from those who've walked ahead all serve you well.";
TSUHENSEI["印綬"].month = "A “Direct Resource” month — a current of wisdom and recharging. What you take in this month becomes your future strength. Invest in study, in reading, in conversations with a mentor. Don't rush toward results; know this as a season for storing up.";

/* ---------- DIRECTIONS (theme / tip only) ---------- */
DIRECTIONS[0].theme = "Love, trust, healing";
DIRECTIONS[0].tip = "A direction for deep bonds — find a quiet spot and talk things through";
DIRECTIONS[1].theme = "Turning points, savings, fresh starts";
DIRECTIONS[1].tip = "A direction that lends its strength when you want to make a change";
DIRECTIONS[2].theme = "Challenge, expression, youth";
DIRECTIONS[2].tip = "A direction suited to morning action and starting something new";
DIRECTIONS[3].theme = "Matchmaking, travel, negotiations";
DIRECTIONS[3].tip = "The best direction for dates, first meetings and business talks";
DIRECTIONS[4].theme = "Beauty, learning, attention";
DIRECTIONS[4].tip = "A direction for the hair salon, exhibitions and study";
DIRECTIONS[5].theme = "Home, stability, the earth";
DIRECTIONS[5].tip = "A direction that nurtures family time and a careful, unhurried life";
DIRECTIONS[6].theme = "Money luck, pleasure, harvest";
DIRECTIONS[6].tip = "A direction where good meals and easy conversation call in money luck";
DIRECTIONS[7].theme = "Work, big moments, your seniors";
DIRECTIONS[7].tip = "A direction for important negotiations and advice from those above you";

/* ---------- MOON_PHASES (note only) ---------- */
MOON_PHASES[0].note = "a day to set intentions";
MOON_PHASES[1].note = "a day to get moving";
MOON_PHASES[2].note = "a day for decisions and action";
MOON_PHASES[3].note = "a day for finishing touches";
MOON_PHASES[4].note = "a day of harvest and gratitude";
MOON_PHASES[5].note = "a day to begin letting go";
MOON_PHASES[6].note = "a day for clearing and cleansing";
MOON_PHASES[7].note = "a day to quietly prepare";

/* ---------- DAILY_QUOTES ---------- */
DAILY_QUOTES.splice(0, DAILY_QUOTES.length,
  "Doubt is proof that you're taking your life seriously.",
  "Today's small step becomes tomorrow's great turning point.",
  "Fate is half the stars, and half your own choosing.",
  "A day when nothing works may be a signal to change direction.",
  "The moment you compare yourself to someone, your story starts to fade.",
  "The things that look most like chance are the ones that come to mean the most.",
  "Whichever way your heart moved, there was a reason.",
  "Resting, too, is a real way of moving forward.",
  "Wishes come true in the order they are spoken.",
  "It's fine for today's you to be different from yesterday's.",
  "Some views can only be found along the long way around.",
  "Anxiety is just a hope that hasn't been named yet.",
  "Every letting-go clears a seat for something new.",
  "Your intuition is made of your own history.");

/* ---------- SCORE_COMMENT (same shape: 5 themes × 5 levels × 2 variants) ---------- */
SCORE_COMMENT.total = [
  ["On days that won't go your way, the strongest thing you can do is choose rest. It's okay to be gentle with yourself today.", "A day for gathering energy. Not “I did nothing” — call it “I recharged properly,” because that's what it is."],
  ["Today may feel a little heavy. That weight is proof you're living seriously. Take smaller steps, and make each one sure.", "No need to rush. Whatever you put in order today becomes a gift to tomorrow's you."],
  ["A calm current today. Your usual care is quietly building trust. Keep going just as you are.", "Level days are when your foundation grows. People who honor their routines are stronger than they look."],
  ["A tailwind is blowing. The thing you've been meaning to move — today it moves lightly. Take the step.", "The current is on your side today. Your preparation is already done. Go forward with confidence."],
  ["The finest of alignments. Everything you've built shines clearly today. Receive it without shrinking.", "The stars and the calendar are both on your side. Save your most important step for today. You'll be fine."],
];
SCORE_COMMENT.love = [
  ["No need to chase love today. Filling your own heart first is the truest kind of charm.", "A day to take care of yourself. Your own ease and comfort are what draw the next connection in."],
  ["Their words may weigh on you today. That sensitivity is the other face of your kindness. Take a deep breath.", "A slow day is fine. The calm you bring as a listener reaches them more than you know."],
  ["A gentle current in your relationships. Small things — a greeting, a smile — are quietly growing your connections.", "Nothing needs forcing today. You look your best exactly as you are."],
  ["Your antenna for meetings and momentum is up. Show your face when you're invited — your charm carries well today.", "Hearts draw closer easily today. A word to the one on your mind will land naturally now."],
  ["Love is in full bloom. Put your honest feelings into words and the relationship takes a real step forward. Be brave.", "A perfect day for love. Your feelings will be received just as they are. Go straight ahead."],
];
SCORE_COMMENT.work = [
  ["Today, defense is the right play. Your future self will thank you for a day spent double-checking and tidying tasks.", "You don't have to push today. Easing the pace is part of doing the job well."],
  ["A day for steady, patient work. It may not sparkle, but the right people notice your care.", "A small step is plenty today. One millimeter past yesterday still counts as progress."],
  ["Steady focus carries you today. Doing the usual work in the usual way — that, too, is real skill.", "A day when routine shines. What you call ordinary is what someone else calls impressive."],
  ["Ideas run sharp today. Say the thought out loud — the response will be good.", "A day made for a challenge. That proposal you've been warming up would travel well today."],
  ["Your winning streak is at its peak. Presentations, negotiations, the big one — today's the day. Your preparation won't betray you.", "Work luck is in top form. Take center stage without apology, and receive what you've earned."],
];
SCORE_COMMENT.money = [
  ["A day to let your wallet rest. The money you don't spend becomes tomorrow's options.", "If the urge to buy something strikes, wait until tomorrow. If you still want it then, it's real."],
  ["A good day to look over fixed costs and small leaks. The unglamorous move pays off later.", "A day of defensive money luck. The budget you tidy today makes next month easier."],
  ["Prudence is the lucky move today. Sketch out a savings plan and your mind settles along with it.", "A day you can face your money calmly. Even just looking at the numbers is a step forward."],
  ["Money luck is rising. A good buy or a lucky find may cross your path — your instincts can be trusted today.", "Useful offers tend to find you today. It costs nothing to keep your antenna up."],
  ["Money luck is in top form. When the chance comes around, receive it proudly. Abundance moves in circles.", "A day of harvest. Whatever money or connection arrives today, accept it with easy gratitude."],
];
SCORE_COMMENT.health = [
  ["Your body is asking for rest. An early night is the surest luck-boosting move there is.", "If you feel tired, that's evidence of effort. Make recovery today's first priority."],
  ["Light stretching will loosen the body, and the heart follows. Keep it gentle.", "A day for loosening. Just letting your shoulders drop is enough — your body will answer."],
  ["Your condition is steady. A balanced meal today builds tomorrow's energy.", "A calm day for the body. Water and sleep — get the basics right and that's plenty."],
  ["Your body feels light today. A walk or a little exercise will clear the skies inside, too.", "Energy is filling back up. The more you move, the more your luck starts moving with you."],
  ["Body and spirit are both in top form. If you're starting a new habit, start it today — your body will keep up.", "Vitality is overflowing. Today your body says yes to the things you've been wanting to do."],
];

/* ---------- SHOGO_ZODIAC / SHOGO_KYUSEI (exact per docs/I18N.md §3) ---------- */
SHOGO_ZODIAC["牡羊座"] = "Daybreak";
SHOGO_ZODIAC["牡牛座"] = "Harvest";
SHOGO_ZODIAC["双子座"] = "Wind-Crossed";
SHOGO_ZODIAC["蟹座"] = "Moonshadow";
SHOGO_ZODIAC["獅子座"] = "Midday";
SHOGO_ZODIAC["乙女座"] = "White-Dew";
SHOGO_ZODIAC["天秤座"] = "Twilight";
SHOGO_ZODIAC["蠍座"] = "Abyssal";
SHOGO_ZODIAC["射手座"] = "Horizon";
SHOGO_ZODIAC["山羊座"] = "Frost-Night";
SHOGO_ZODIAC["水瓶座"] = "Dawn";
SHOGO_ZODIAC["魚座"] = "Star-Sea";

SHOGO_KYUSEI["一白水星"] = "Guide";
SHOGO_KYUSEI["二黒土星"] = "Nurturer";
SHOGO_KYUSEI["三碧木星"] = "Pioneer";
SHOGO_KYUSEI["四緑木星"] = "Windcaller";
SHOGO_KYUSEI["五黄土星"] = "Sovereign";
SHOGO_KYUSEI["六白金星"] = "Commander";
SHOGO_KYUSEI["七赤金星"] = "Storyteller";
SHOGO_KYUSEI["八白土星"] = "Sage";
SHOGO_KYUSEI["九紫火星"] = "Lightkeeper";

/* ---------- LUCKY_ACTIONS ---------- */
LUCKY_ACTIONS.splice(0, LUCKY_ACTIONS.length,
  "Open a window first thing and take a deep breath",
  "Clear one thing off your desk",
  "Send a short thank-you to someone who has helped you",
  "Take a different route home",
  "Try one new item at the convenience store",
  "Touch a houseplant or some flowers",
  "Start getting ready for bed ten minutes early",
  "Tell someone one thing you like about them",
  "Tidy out your bag",
  "Slowly savor a warm drink",
  "Read just one page of that book you've been meaning to start",
  "Sort just three photos on your phone",
  "Smile at yourself in the mirror before you head out",
  "Polish your shoes with care",
  "Recall three good things about today before you sleep",
  "Wear a color you wouldn't usually choose");

/* ===== data.en.js chunk 3: TAROT_MINOR / MINOR_SUITS / MIND_WORDS / PREF_GEO /
   ASCENDANT_DESC / MOON_TODAY_DESC / AISHO_BOND / AISHO_PLAY / BOND_FRICTION /
   SHOGO_NIKKAN / PERSPECTIVE_LABELS / PERSPECTIVE_NUANCE ===== */

/* ---------- TAROT_MINOR: 56 minor arcana (up / rev / advice) ----------
   Order: wands ace..king, cups ace..king, swords ace..king, pentacles ace..king */
[
  // Wands
  ["The moment a new passion catches fire. That “I want to try this” instinct is the real thing. Take the first step before the reasoning.", "The spark is already in your hand. For now you wait on the wind — stack the firewood without rushing, and the moment of ignition will come.", "No day like the present. Start today, even if only for five minutes."],
  ["A card of planning, globe in hand. Widen your view, and the direction of your next move comes into focus.", "It may be assumptions, not circumstances, that narrowed your options. Spread the map back out — there are still plenty of roads.", "Pick one destination and write it down in words."],
  ["A figure on the heights, watching for the ships to return. The moves you made are already in motion. Results are near.", "The ships are simply running a little late. Nothing you set up has gone to waste. While you wait, get ready to receive.", "Rather than doubting the outcome, prepare for its arrival."],
  ["A card of celebration on solid ground. You have reached a milestone — it is safe to be glad about it.", "It doesn't have to be perfect to be celebrated. Honoring small wins properly is what builds the next foundation.", "Give yourself one small reward today. You've earned it."],
  ["A card of friendly sparring. The clashing isn't hostility — it's proof of heat. You grow stronger in the scrum.", "Stepping out of a contest no one can win is its own kind of strength. Leave the war of attrition and return to your own ground.", "Measure yourself against yesterday's you, not against rivals."],
  ["A card of victory and recognition. What you've built is being acknowledged — a moment to hold your head high.", "The applause just hasn't arrived yet; the value is already there. Be the first to acknowledge what you've done.", "Put one of your achievements into visible form."],
  ["A card of holding the high ground. Your current position is worth defending. Hold on for one more push.", "You don't have to fend off everything alone. Narrow down what's truly worth defending, and your breathing room returns.", "Choose just one “this, I won't give up.”"],
  ["Eight wands streaking across the sky — a card of sudden momentum and tailwinds. Things begin moving all at once.", "The slowdown isn't a stall; it's an adjustment. Don't hurl more in a panic — watch where the arrows already in flight will land.", "Send that message now. Speed is what carries the luck."],
  ["A card of standing your ground, bruises and all. What you've protected this far is about to bear fruit.", "A sign that fatigue is piling up. Easing your guard and resting is a perfectly good strategy too.", "Before the final push, get one proper night's sleep."],
  ["A card of carrying all ten wands. That you can bear them is proof of strength — but you don't have to carry every one.", "A good moment to start setting burdens down. Everything you release frees strength for what truly matters.", "Hand one of your tasks to someone you trust."],
  ["A messenger bearing news for the curious. Something exciting is coming your way — it's fine to jump at it.", "Your enthusiasm is spinning its wheels a little, but the direction is right. Test it small and feel for traction.", "If something looks interesting, at least look it up before the day ends."],
  ["The knight of passion charges off. Momentum is your weapon right now — even a slightly premature start rides the tailwind.", "Time to ease off the accelerator. Let the impulse rest overnight — real passion won't fade.", "Check the destination before you move. It doubles the momentum."],
  ["A card of warm, sunlike charisma. Your brightness moves the room. Step into the center, unapologetically.", "It's natural for confidence to waver some days. When your flame runs low, stay close to the people who cheer you on.", "Lift one person's spirits today with your own words."],
  ["The king who holds the vision aloft. People will follow the future you've drawn. Think big, and say it out loud.", "Just check you haven't run out ahead alone. Keep the flag raised, match your stride to your companions, and you're unshakable.", "Share one of your plans with someone you trust."],
  // Cups
  ["The cup of love, overflowing. If your heart moved, that is the surest answer there is.", "First, fill your own cup. Every kindness you show yourself becomes kindness you can offer others.", "Put one thing that moved you today into honest words."],
  ["Two hearts meeting as equals. A warm, even bond is forming. The feelings you offer will reach them.", "A misunderstanding isn't a sign of the end — it's a cue for conversation. One clarifying word brings the bond back.", "Take the first step toward someone who matters."],
  ["Raised cups and friendship. Time with your people carries luck today — saying yes to the invitation is the right call.", "You're just a little tired of crowds. Time with a few easy people will restore you properly.", "Make time to laugh with someone you like, even briefly."],
  ["Arms folded, lost in thought. The boredom isn't stagnation — you're one moment from noticing the cup being offered.", "You're beginning to wake up. In the routine you thought you'd seen enough of, a new cup is being held out.", "Look carefully at one familiar sight today, as if for the first time."],
  ["Gazing at three spilled cups. The sorrow is real. But behind you, two cups still stand.", "Your head is beginning to lift. The moment you notice what remains, recovery has already begun.", "Count three things that remain, not the things that were lost."],
  ["Nostalgia and innocent affection. Old ties and old memories lend you a gentle strength today.", "Memories are allies, not a place to live. Bring back only the purity you had then, and return to now.", "Message an old friend, or walk somewhere that holds a memory."],
  ["Seven cups floating in the clouds — dreams and options. The richer your imagination, the more natural it is to waver.", "The mist is clearing, and the real cup is coming into view. Choose by “does it move me?”, not “does it seem doable?”", "Write every option down on paper — one of them will quietly shine."],
  ["Leaving the stacked cups behind and setting out. A graduation. Walking away isn't betrayal — it's growth.", "Wavering between going and staying proves both hold meaning. No need to rush — you may wait for the moon to fill.", "Name one thing you have finished learning."],
  ["The card of wishes fulfilled. Nine cups line up on your side. Your hopes are leaning toward coming true.", "Feeling full yet unfulfilled is a sign to update the wish itself. Sketch the next one.", "Tonight, choose one wish and make it specific."],
  ["A family beneath the rainbow. Deep ease and harmony are arriving. An ordinary evening together is the best omen of all.", "It may not match the picture-perfect ideal, but if love is there, it's enough. One smile today beats a flawless family portrait.", "Go ahead and schedule a meal with the people you love."],
  ["A fish peeks out of the cup — a message for the sensitive. Don't miss the small flutters and signals from your intuition.", "Daydreaming is a talent too. But try just one idea in the real world, and the magic becomes real.", "When an idea drifts by, write it down."],
  ["The romantic knight, approaching slowly on a white horse. A heartfelt invitation or confession is drawing near.", "The ideals are running ahead, but the feelings are real. Back up your words with one concrete act.", "Say how you feel directly, in plain words."],
  ["The queen of deep empathy and healing. Your gift for listening will rescue someone. Staying close is what builds trust today.", "You may be absorbing too much of other people's feelings. Drawing a boundary isn't coldness — it's how you stay kind for the long run.", "When you're drained, claim some time alone by the water, or in a warm bath."],
  ["The mature king who governs emotion. Your unshaken calm is your most persuasive quality.", "Suppressed feelings don't vanish; they only sink. Let them flow, little by little, somewhere safe — and your vessel grows larger.", "Confide one true feeling to someone safe."],
  // Swords
  ["The blade of clarity that cuts to the truth. Your mind is sharp, and the essence shows in a single stroke. If you're going to decide, decide today.", "Too much information is fogging the blade. Pause the input for a while, and the answer turns simple again.", "Write your conclusion in one sentence. If you can, you already have your answer."],
  ["Blindfolded, swords crossed — a card of deferral. Right now, choosing not to choose has meaning of its own.", "The blindfold is coming off. Face the fact you've been avoiding, and the stalemate unwinds on its own.", "Gather just one more piece of information today."],
  ["Three swords through the heart — a card of facing pain squarely. It hurts because it mattered that much.", "The rain is starting to lift. Once you can put the wound into words, the healing is already half done.", "Write the hurt down on paper, close it, and sleep."],
  ["A card of quiet rest. Recharging between battles isn't retreat — it's part of the next move.", "The season of rest is drawing to a close. Sit up slowly, and restart with a gentle warm-up.", "Don't pack today's schedule — leave deliberate white space."],
  ["A battle that feels hollow even in victory. Walking away from this one is the win. Choosing your battlefield is a skill too.", "A wind of reconciliation is starting to blow. Let go of one point of pride, and much of what was lost comes back.", "Decide by what's precious, not by what's correct."],
  ["Crossing still waters — a card of passage. From rough ground toward a calmer shore; it's time to move with the current.", "Load the boat with too much of the past and it won't move. Decide what stays behind, and the crossing lightens.", "Change your surroundings a little — even a new seat helps."],
  ["Tiptoeing off with an armful of swords — a card of strategy. A head-on charge isn't the only way. Enjoy the game of wits.", "This is when openness, not stealth, becomes the shortcut. Show your hand, and you gain the weapon called trust.", "Lay just one of your cards on the table."],
  ["Bound and ringed by swords — but the rope is loose, and the blindfold comes off by your own hand. This is not checkmate.", "The bindings are loosening. Question one “it's hopeless anyway,” and the exit is right there.", "Pick one reason you “can't,” and test whether it's true."],
  ["Waking in the middle of the night — a card of worry. Nine-tenths of it is shadow, enlarged by the dark.", "Dawn is near. Seen in morning light, the worry turns out to be a size you can handle.", "Write out every worry, then circle the ones you can act on."],
  ["An ending just before dawn. One chapter has fully closed — which is exactly why the next can begin.", "The worst has already passed. The swords are coming out of your back. It's all right to focus solely on recovery.", "Declare one thing over, and draw the line."],
  ["Sword raised, keeping watch — a card of observation. Information decides this round. Look closely and research well before you move.", "Asking the person directly beats inflating a guess. One fact-check, and the fog clears.", "Take one thing that's been nagging you and verify it directly today."],
  ["The knight charging headlong into the wind. Right now you can move faster than you can think — and quick decisions land well.", "Speed is a talent, but today, take one breath. Not a hard brake — just a careful hand through the curve.", "Before you hit send, read it over one more time."],
  ["The keen, composed queen. Your judgment stays clear of the emotional currents, and the elegance of your boundaries earns trust today.", "The blade of rightness may be getting a touch too sharp. The same point, warmed by a spoonful of kindness, lands differently.", "Before the hard words, imagine one thing they might be carrying."],
  ["The king of fair judgment. Your insistence on principle becomes the standard others steer by. Stand firm and unswayed.", "Take care not to cut hearts with logic. One word of empathy before the sound argument, and your intellect is unbeatable.", "Advice works best when it has been asked for."],
  // Pentacles
  ["Receiving the seed of a sure harvest. A practical, solid opportunity is coming around. It's safe to take it.", "Time to replant. Tend the soil — your environment — and the same seed grows differently.", "Book the first step, money or work, before today ends."],
  ["Juggling two coins — a card of balance in motion. You are managing both, and that sense of balance is a talent.", "A sign you're juggling too many. Set one down for now, and you won't drop them all.", "Just for today, trim one plan and one expense."],
  ["The craftsman's skill, recognized — a card of collaboration. Someone is truly watching how you work.", "Time to revisit how you work together. One quick word to confirm each other's roles, and the team transforms.", "Offer your strengths to the team without holding back."],
  ["Holding the coins close — a card of keeping. A guarded stance is a mark of prudence. That foundation is what lets you attempt what's next.", "Time to loosen your grip a little. New abundance flows into the space left by what you release.", "Sort what you keep from what you keep in motion."],
  ["Two figures walking through the snow. You are not the only one struggling — there is a companion at your side.", "A light is burning close by. Asking for help isn't weakness — it's the courage to knock.", "Take one worry to someone you trust."],
  ["The hand that gives and the hand that receives. You are inside the circulation — what you give freely comes back around.", "Rebalance the giving and the receiving. Restore the evenness, and this bond will last.", "Pass one kindness you've received along to someone else."],
  ["Pausing to watch what you've grown. No need to rush — your field is coming along well.", "Time to inspect the crop. Spotting the branch that isn't growing isn't failure — it's your next plan.", "Stop for a moment and count what your persistence has produced."],
  ["Quietly honing the craft, coin by coin. Steady work is the strongest magic. Today's coin becomes tomorrow's mastery.", "If the work has become mere motions, it's time to remember the meaning. Knowing what each coin is for changes the hands that make it.", "Set aside fifteen minutes today to sharpen a skill."],
  ["At ease in the garden — a card of self-made abundance. Today you may openly savor what you built with your own hands.", "A sign to rethink what counts as a reward. Spending that honors you keeps its glow far longer than a splurge.", "Choose one good-quality reward, worthy of your effort."],
  ["Three generations beneath the family crest — a card of legacy. This is lasting stability, the wealth of joining a longer current.", "Time to adjust the family or house rules. Keep the tradition — and it's fine to update the parts that no longer fit today.", "Start one long-horizon plan — savings, or health."],
  ["Gazing into the coin — the seedling of study. Solid news is on its way, and this is a fine moment to begin learning.", "Starting small is the best insurance against plans that fizzle. Even opening the textbook counts as having started today.", "Spend ten minutes on the basics of something that interests you."],
  ["The steadfast knight surveying the field. Nothing flashy — but no one's stride is surer than yours, and trust is accumulating.", "What looks like standstill is careful tilling. Keeping your own pace is your strength.", "Keep one routine today, calmly and completely."],
  ["The queen of practical warmth. You keep both work and home in order, and people entrust you with their ease.", "Has caring for everyone pushed you to the back of the line? Filling your own cup is essential practical work too.", "Tidy one spot — a desk, a corner of a room — and your luck tidies with it."],
  ["The king who has brought abundance to completion. Your record and your trust are ample. Sit solidly — it's your turn to share with the next generation.", "Check whether your standards have hardened into stubbornness. Entrust one way of doing things to someone else, and your capacity grows again.", "Gift one story from your experience to a friend or someone younger."],
].forEach((t, i) => { TAROT_MINOR[i].up = t[0]; TAROT_MINOR[i].rev = t[1]; TAROT_MINOR[i].advice = t[2]; });

/* ---------- MINOR_SUITS: themes ---------- */
MINOR_SUITS.wands.theme = "passion and action";
MINOR_SUITS.cups.theme = "emotion and connection";
MINOR_SUITS.swords.theme = "thought and decision";
MINOR_SUITS.pentacles.theme = "harvest and work";

/* ---------- MIND_WORDS: morning one-liners ---------- */
MIND_WORDS["大吉"].base = [
  "Today's lead role is yours",
  "Leave the hesitation behind — tomorrow's share too",
  "Today, your gut is right about pretty much everything",
  "Tailwind day. It'd be a waste not to raise the sail",
  "That “I think I can” feeling? Today, believe it",
  "Today, hesitation is the only real waste",
  "Don't save today's momentum — spend every bit of it",
  "“Someday” just became today",
  "The stars are aligned. The lead's seat is saved for you",
  "Today, skip imagining the “no”",
  "You're slightly invincible today — use it with care",
  "Wishes come true today in the order you say them out loud",
];
MIND_WORDS["大吉"].love = [
  "If not today, when are you going to say it?",
  "Confessions come with a tailwind today",
  "That coincidence that feels like fate? Today, trust it",
  "If you miss someone, today you can just go see them",
];
MIND_WORDS["大吉"].work = [
  "Start with the biggest task — today it falls first",
  "Pitch, negotiate, propose — today you own them all",
  "The “probably impossible” one is exactly what to try today",
  "Future you will thank you for today's decision",
];
MIND_WORDS["大吉"].money = [
  "Good money news today leans genuine",
  "A big-moment expense today counts as an investment",
  "Buying something built to last? Today's your lucky day",
  "Money luck: full tank. Just decide where it goes first",
];
MIND_WORDS["大吉"].health = [
  "Your body feels light today — luck moves as much as you do",
  "Peak condition today. Your body is rooting for the challenge",
  "Fulfillment beats fatigue today. Moving is lucky",
  "Every drop of sweat clears the mood — and the luck",
];
MIND_WORDS["吉"].base = [
  "Overtake yesterday's you — by just one step",
  "When in doubt, it's okay to pick “forward”",
  "That idea you've been keeping warm can come out today",
  "A day for giving one small green light after another",
  "A day to promote “eventually” to “today”",
  "Eighty percent ready is ready enough — start running",
  "Today, luck is handed out only to those who move",
  "Today, your asks land better than you expect",
  "The top of your someday list is ripe today",
  "Catch the good current first — think later",
  "“I want to try it” counts as a real reason today",
  "Half a step ahead, the right tailwind is waiting",
  "Whoever says hello first takes home the good luck today",
  "One of the seeds you planted yesterday sprouts today",
  "Get the first word out, and the rest flows",
  "Small courage earns real interest today",
];
MIND_WORDS["吉"].love = [
  "It's fine for the first text to come from you today",
  "The more you smile today, the better your chances",
  "A day to turn “sometime” into an actual date",
  "One honest sentence closes the distance fast today",
];
MIND_WORDS["吉"].work = [
  "Skip the maneuvering — the direct ask works today",
  "Raise your hand first in the meeting, and the flow follows",
  "Your slow-cooked idea is at serving temperature today",
  "Doing it before you're asked — that's what builds trust today",
];
MIND_WORDS["吉"].money = [
  "Spend it in the right place, and it comes back today",
  "Invest in yourself today — that money will work for you",
  "Choose “because I love it” over “because it's cheap”",
  "A good day to start that money talk or review",
];
MIND_WORDS["吉"].health = [
  "A brisk-walk pace is exactly right today",
  "Thinking of a new workout? Today's the day to start",
  "The more you move your body, the sharper your mind today",
  "Take the stairs, not the elevator — that alone shifts the flow",
];
MIND_WORDS["平"].base = [
  "Doing “ordinary” with care is the strongest move there is",
  "Today, steady and unbothered is the winning strategy",
  "Business as usual — just in a slightly better mood",
  "Zero fireworks. But the bricks are definitely stacking",
  "The unspecial days are what a life is built on",
  "Normal operations today. Just keep the tank full",
  "A day with nothing planned is a day anything can happen",
  "Take your usual route — with one small detour",
  "The water's calm. A fine day to polish the oars",
  "It's you who turns a plain day into a good one",
  "Not everything at once — “one at a time” works today",
  "Not too hard, not too lazy. The middle is right today",
  "Keep quietly going — luck catches up from behind",
  "Good weather for sowing. The sprouts can come later",
  "A “so-so” day is secretly the freest day of all",
  "Collect three small wins today, and you've won the day",
  "No waves today — which means you can see a long way",
  "Small steps are fine. Just point them the right way",
  "Today things work out in order of who rushes least",
  "Turn just one “later” into a “now” today",
  "Today's for the run-up. Jump when the wind arrives",
  "When nothing changes, you get to be the change",
  "A good mood isn't something you wait for — you make it",
  "Brew your usual cup with a little extra care today",
];
MIND_WORDS["平"].love = [
  "A day for growing comfort, not chasing progress",
  "Add one extra line to your usual “good morning”",
  "Even on days apart, the bond is quietly growing",
  "Don't let the comfort of them beside you go unnoticed",
];
MIND_WORDS["平"].work = [
  "Knock out a task with no deadline, and today's a win",
  "Today's dull prep work becomes next week's star",
  "Careful replies alone move your reputation, quietly",
  "Do your usual work ten percent more precisely today",
];
MIND_WORDS["平"].money = [
  "Your wallet is at peace. Best leave it that way",
  "Just reviewing receipts sets your money flowing right",
  "Go ahead and praise the you who didn't buy it",
  "Trim one recurring bill, and the future gets lighter",
];
MIND_WORDS["平"].health = [
  "Invest in sleep tonight — tomorrow will bounce",
  "Warm water, stretches, deep breaths. Boring works today",
  "Walk one stop further than usual today",
  "Give up thirty phone minutes tonight, and the morning changes",
];
MIND_WORDS["静"].base = [
  "Today goes to the ones who tidy up",
  "The courage not to push is a strength too",
  "A day to clear the desk — and the mind",
  "Standing still counts as moving forward",
  "What you cut today becomes tomorrow's speed",
  "The reply can wait until tomorrow. Today is prep day",
  "Don't rush. That alone makes today go well",
  "Turn the volume down, and the important sounds come through",
  "Today's not-to-do list is what protects tomorrow",
  "The comeback starts tomorrow. Today, firm up the ground",
  "Let go of one thing, and one thing gets lighter",
  "Watch your own daily life from the audience seats today",
  "Take in less today, and the mind settles",
  "Those who last know when to stop and sharpen the blade",
];
MIND_WORDS["静"].love = [
  "A day for listening, not closing distance",
  "Don't read into the slow reply. It's just that kind of day",
  "Quietly check in on the “usual” between you two",
  "Let the words rest overnight — they'll land better",
];
MIND_WORDS["静"].work = [
  "Redoing beats starting new today",
  "Review and sort — that's where the next win hides",
  "Research and groundwork today. The stage can wait",
  "The courage to say no is today's best time-saver",
];
MIND_WORDS["静"].money = [
  "A day for trimming, not adding to the cart",
  "Leave today's cart overnight — you'll be glad you did",
  "A perfect day to take stock of your subscriptions",
  "Not sure about that purchase? Ask tomorrow's you",
];
MIND_WORDS["静"].health = [
  "Ten minutes in a hot bath — today's best luck ritual",
  "Screens off. Give your eyes and heart a break",
  "Tuck three-breath pauses into the corners of today",
  "An early night is how you prep tomorrow's luck",
];
MIND_WORDS["休"].base = [
  "Today, work hard at not working hard",
  "Recharging counts as a real plan",
  "Be gentle with yourself. That's today's right answer",
  "Today's only quota: rest well",
  "The world will still turn tomorrow. Let it, for today",
  "The strongest person is the one who can power down",
  "Today, the sofa is your assigned seat",
  "Recovery goes to those who cancel plans first",
  "Doing nothing is secretly the hardest, noblest work",
  "Today's staple diet: rest, plus whatever you love",
  "Naps over notifications. Blankets over screens",
  "Every bit of rest today becomes strength for tomorrow",
];
MIND_WORDS["休"].love = [
  "Recharge solo first — the date can come after",
  "Today, a single “good night” text earns full marks",
  "Not forcing yourself along is a kindness too",
  "Even to someone you love, “another time” is okay today",
];
MIND_WORDS["休"].work = [
  "Today, 60 percent is good enough to hand in",
  "Close up shop on today's effort — right on time",
  "Overcommitment alert: saying no won't lower your worth",
  "It's fine to leave a little work for tomorrow's you",
];
MIND_WORDS["休"].money = [
  "Try the game of not opening your wallet today",
  "Look for fun that costs nothing — today you'll find it",
  "Shopping while tired? Rest first, buy later",
  "Today is for gazing at the shop window, not buying",
];
MIND_WORDS["休"].health = [
  "Sleepiness is right. Don't fight it",
  "On days you can't push, not pushing is the answer",
  "Something warm to drink, then early under the covers",
  "Today's best doctors: a nap and a warm meal",
];

/* ---------- PREF_GEO: 47 prefectures in romaji (coordinates untouched) ---------- */
[
  "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima", "Ibaraki",
  "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa", "Niigata", "Toyama",
  "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu", "Shizuoka", "Aichi", "Mie",
  "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama", "Tottori", "Shimane",
  "Okayama", "Hiroshima", "Yamaguchi", "Tokushima", "Kagawa", "Ehime", "Kochi", "Fukuoka",
  "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa",
].forEach((n, i) => { PREF_GEO[i][0] = n; });

/* ---------- ASCENDANT_DESC ---------- */
Object.assign(ASCENDANT_DESC, {
  "牡羊座": "Energetic and direct. From the first meeting, people see you as someone who acts",
  "牡牛座": "A calm presence and a sense of security. Your unhurried air invites trust",
  "双子座": "Light on your feet and a natural conversationalist. You come across as bright and quick to read the room",
  "蟹座": "An approachable, warm atmosphere. Even at a first meeting, people find you genuinely likable",
  "獅子座": "A radiant, confident presence. You draw eyes even when you say nothing",
  "乙女座": "Neat, courteous, precise. Your attentiveness to detail is the first thing people notice",
  "天秤座": "Graceful, well-balanced manners. You strike people as effortlessly sociable and fair to everyone",
  "蠍座": "A quiet but powerful pull. Mysterious — the kind of person others remember",
  "射手座": "Open and easygoing. Being with you feels like the view suddenly widens",
  "山羊座": "Earnest and dependable. People quickly mark you as someone who has it together",
  "水瓶座": "A free, unconventional air. Your individuality comes through, cool and understated",
  "魚座": "Soft and dreamlike in bearing. An air that makes people want to look after you",
});

/* ---------- MOON_TODAY_DESC ---------- */
Object.assign(MOON_TODAY_DESC, {
  "牡羊座": "The whole world runs impatient and action-minded today. Acting the moment inspiration strikes is the lucky move",
  "牡牛座": "Luck lives in what delights the senses today. Savor good food and comfortable things, carefully",
  "双子座": "Information and conversation pick up speed today. Messages, posts and chatter all have the wind behind them",
  "蟹座": "Feelings turn inward today. A day for time at home and the people closest to you",
  "獅子座": "Self-expression is in the spotlight today. The courage to take center stage will be properly rewarded",
  "乙女座": "The power to put things in order runs high today. Tidying, planning and self-care all go smoothly",
  "天秤座": "A breeze moves through relationships today. Good for dialogue, mediation and dates",
  "蠍座": "Emotions run deep today. Suited to honest conversations and long, focused work",
  "射手座": "The pull toward far-off places grows today. Learning, travel plans and a spirit of adventure are favored",
  "山羊座": "Today brings the strength to move reality forward. Steps toward work and goals take solid shape",
  "水瓶座": "Ideas run free today. A good day for new tools, new companions and new thinking",
  "魚座": "Sensitivity opens up today. Art, music and quiet healing time will fill the heart",
});

/* ---------- AISHO_BOND: label + note (scores untouched) ---------- */
[
  ["比肩", "comrades walking side by side", "An equal bond with no need for formality. You clash at times, but you're just as quick to understand each other."],
  ["劫財", "partners on the same wavelength", "Together, you build momentum. Just know that lending money and impulse buys are this pairing's one weak spot."],
  ["食神", "simply fun to be around", "A soothing current — just being nearby lets your shoulders drop. Your tastes in food tend to match, too."],
  ["傷官", "someone who sparks your senses", "A stimulating tie that stirs your sensibilities. All the more reason for both of you to choose your words with care."],
  ["偏財", "someone who widens your world", "With this person, your range and your circle keep expanding — a light-footed, adventurous tie."],
  ["正財", "someone who builds your sense of security", "Trust grows here steadily. Nothing flashy — just the kind of security that lasts."],
  ["偏官", "someone who trains you", "They bring pressure, and with it, real growth. Just remember to build rest into your time together."],
  ["正官", "someone who makes you stand up straighter", "Around this person, you want to be your best self — a relationship built on respect."],
  ["偏印", "someone who feeds you ideas", "They always hand you an unexpected angle — a tie that never gets old."],
  ["印綬", "someone who guides you", "A sheltering current of wisdom and reassurance. The more openly you lean on them, the better it goes."],
].forEach(([k, label, note]) => { AISHO_BOND[k].label = label; AISHO_BOND[k].note = note; });

/* ---------- AISHO_PLAY ---------- */
Object.assign(AISHO_PLAY, {
  "地地": "Food pilgrimages and experiences that leave something tangible. You both have an eye for the real thing, so choosing quality inns and gear makes the satisfaction soar.",
  "地水": "Hot springs, nature, home cooking. For you two, an unscheduled day off is the greatest luxury. Make the quality of your unwinding the whole point.",
  "地火": "The outdoors, plus great food. Fire says “let's go!” and Earth handles the logistics — when the roles click, you're an unbeatable team.",
  "地風": "A city stroll with one destination in mind. Air finds the interesting shop, Earth appraises the goods — a natural shopping duo. Flea markets and street markets suit you too.",
  "水水": "Music, movies and long talks at home. If you go out, make it the waterside or a museum. Sinking into your shared world is the best recharge there is.",
  "水火": "Concerts, movies, live sports — experiences where your emotions move together are the lucky choice. The debrief afterward is the real main event.",
  "水風": "Bookstores, museums, long café conversations. The deeper the talk goes, the closer you two become.",
  "火火": "A spontaneous trip the day the idea strikes. Momentum over planning — for you two, slightly blurry photos are exactly right.",
  "火風": "Festivals, events, scouting new places. The more “firsts” you share, the brighter this pairing burns.",
  "風風": "Café-hopping and talking until you're spent. On any trip, the conversation along the way — not the destination — is your main dish.",
});

/* ---------- BOND_FRICTION ---------- */
Object.assign(BOND_FRICTION, {
  "比肩": "Two people who won't budge, digging in. Decide in advance whose turn it is to decide today, and peace holds.",
  "劫財": "Loose habits around lending money and splitting bills. Set rules for this one thing early, and you'll stay close for good.",
  "食神": "Indulging each other into a comfortable slump. Take turns being the one who says “right, let's get moving.”",
  "傷官": "Words with barbs. Agree in advance where the joking line sits, and this tie's edge becomes its greatest charm.",
  "偏財": "With so much fun out in the world, time for just the two of you slips down the list. A standing monthly date works wonders.",
  "正財": "So sensible that adventure runs short. A few times a year, do something “unlike you” together, and the air freshens.",
  "偏官": "Pushing each other too hard, holding the reins too tight. Simply turning commands into requests transforms this relationship.",
  "正官": "So proper with each other that honesty gets postponed. Make deliberate time for the “actually, there's something…” talks.",
  "偏印": "Moody patches and last-minute cancellations. Flag changes early — keep that one promise, and two free spirits stay comfortable.",
  "印綬": "One over-caring, the other over-relying. Swap roles now and then, and the bond grows even.",
});

/* ---------- SHOGO_NIKKAN: poetic day-master names (per docs/I18N.md §3) ---------- */
Object.assign(SHOGO_NIKKAN, {
  "甲": "the Great Tree", "乙": "the Wildflower", "丙": "the Sun", "丁": "the Lantern", "戊": "the Sacred Peak",
  "己": "the Earth", "庚": "the Steel", "辛": "the Jewel", "壬": "the Great River", "癸": "the Gentle Rain",
});

/* ---------- PERSPECTIVE_LABELS: 5 relations x 10 stars ---------- */
Object.assign(PERSPECTIVE_LABELS.boosted, {
  "比肩": "a partner you can recharge beside", "劫財": "a cheering squad that lends you momentum", "食神": "a healer who keeps you laughing",
  "傷官": "someone whose sensitivity soothes you", "偏財": "a backer who widens your world", "正財": "a support who builds your security",
  "偏官": "a bodyguard watching your back", "正官": "a quiet guardian holding you up", "偏印": "a guide who brings you flashes of insight", "印綬": "a harbor that takes you in whole",
});
Object.assign(PERSPECTIVE_LABELS.giving, {
  "比肩": "a comrade you can't leave be", "劫財": "a partner you can't help rooting for", "食神": "someone you want to delight",
  "傷官": "a rough gem you want to polish", "偏財": "someone you want to take out into the world", "正財": "someone you want to nurture slowly",
  "偏官": "an apprentice worth training", "正官": "someone you want to honor and support", "偏印": "someone you delight in watching over", "印綬": "someone you want to pour your wisdom into",
});
Object.assign(PERSPECTIVE_LABELS.same, {
  "比肩": "a comrade who reads your mind", "劫財": "a co-conspirator for getting carried away", "食神": "a playmate with matching tastes",
  "傷官": "a worthy rival whose sensibility echoes yours", "偏財": "a travel companion who matches your pace", "正財": "a steady duo with values aligned",
  "偏官": "a rival who raises your game", "正官": "a comrade of principle", "偏印": "a fellow free spirit who understands", "印綬": "a bond of quiet mutual understanding",
});
Object.assign(PERSPECTIVE_LABELS.taxed, {
  "比肩": "a worthy rival you refuse to lose to", "劫財": "someone whose whirlwind is half the fun", "食神": "a natural enemy you can't help liking",
  "傷官": "a critic who goes straight for the truth", "偏財": "a captivating someone who keeps you guessing", "正財": "someone who makes you straighten your collar",
  "偏官": "a drill-sergeant coach who forges you", "正官": "a watchful eye that keeps your back straight", "偏印": "a mysterious someone you can't quite read", "印綬": "a master you can't help deferring to",
});
Object.assign(PERSPECTIVE_LABELS.leading, {
  "比肩": "a partner in a friendly tug-of-war", "劫財": "someone you want to sweep along in your momentum", "食神": "someone you want to protect",
  "傷官": "a delicate soul who deserves careful words", "偏財": "someone you want at your side wherever you go", "正財": "someone you want to put at ease",
  "偏官": "a wild horse you hold the reins for", "正官": "your right hand, strongest when relied upon", "偏印": "someone who shines when given free rein", "印綬": "a student who leans on you",
});

/* ---------- PERSPECTIVE_NUANCE ---------- */
Object.assign(PERSPECTIVE_NUANCE, {
  "比肩": "Your daily rhythms match, and an easy, unguarded closeness forms fast.",
  "劫財": "You're on the same wavelength — so take one breath before promises made on momentum.",
  "食神": "Sharing meals is the fastest way this bond deepens.",
  "傷官": "Sharp words will slip in sometimes. Just be careful about where the joking line sits.",
  "偏財": "A tie that widens your range. Every invitation, given or accepted, becomes part of the bond.",
  "正財": "Each small promise kept adds another quiet layer of trust.",
  "偏官": "A healthy tension helps you both grow.",
  "正官": "A comfortable, courteous relationship. Make room for honest hours now and then.",
  "偏印": "If you can enjoy the unpredictable turns, this tie never grows stale.",
  "印綬": "The cycle of teaching and being taught is this bond's best nourishment.",
});
