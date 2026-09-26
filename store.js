(() => {
    const STORAGE_KEY = 'fieldnotes.posts.v1';
    const fallbackCover = 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1500&q=85';
    const starterPosts = [{
            id: 'long-way-good-light',
            title: 'The long way to the good light',
            category: 'Travel',
            date: '2026-09-18',
            excerpt: 'A slow train, a borrowed bicycle, and what happens when you stop trying to arrive on time.',
            cover: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85',
            alt: 'A quiet mountain lake catching the last light of the day',
            body: 'The train took the inland route, which is to say it took its time. Past the last familiar station the hills folded in on themselves, and the windows began to hold more sky than town. I had booked the fast train. A small timetable change made the choice for me.\n\nBy the time I reached the coast, the afternoon had gone soft around the edges. The woman at the bicycle shop found me a rattling blue frame and drew a map on the back of my receipt. No instructions about where to stop. Just a line that bent toward the water.\n\nThere is a particular kind of quiet that only appears when you are moving slowly through a place. Gardens come into focus. Someone is mending a gate. Bread cools behind an open window. You begin to understand a landscape not as a view, but as a collection of ordinary things people have decided to care for.\n\nI arrived late to the beach. The light had already started its slow retreat. It was, without question, the best part of the day.',
            tags: ['Travel', 'Slowing down', 'Notes'],
            status: 'published',
            featured: true
        },
        {
            id: 'small-rituals-morning',
            title: 'Small rituals for a less hurried morning',
            category: 'Rituals',
            date: '2026-09-11',
            excerpt: 'A few gentle ways to make room for yourself before the day gets a say.',
            cover: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85',
            alt: 'Sunlight falling across green leaves',
            body: 'I used to think a good morning had to begin early. The alarm would ring, the list would start, and I would try to outrun the day before it had even happened. It turns out that a little room is more useful than a little speed.\n\nNow the first thing I do is open a window. Not as a productivity ritual, just to hear what the weather has been doing. The kettle comes next. While it warms, I water the plants that are still here, which is a surprisingly good way to remember that most living things prefer steady attention over grand gestures.\n\nThe whole thing takes less than ten minutes. The point is not to perfect the morning. It is to belong to it for a moment before handing it over.',
            tags: ['Rituals', 'Home', 'Wellbeing'],
            status: 'published',
            featured: false
        },
        {
            id: 'objects-keep-stories',
            title: 'The objects that keep our stories',
            category: 'Objects',
            date: '2026-09-03',
            excerpt: 'On well-worn notebooks, chipped cups, and the memory tucked into everyday things.',
            cover: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1200&q=85',
            alt: 'A simple, sunlit desk arranged for a quiet afternoon',
            body: 'There is a blue cup in the cupboard with a hairline crack near its handle. It is not a special cup. It came from a market stall years ago, and the glaze has faded to the color of a cloud. Still, on certain afternoons, I reach for it without thinking.\n\nOur homes are full of these small decisions made in the past. A book kept because someone underlined the sentence that mattered. A table that is just the right height for a long conversation. The things we use often become a sort of soft archive, holding on to the gestures we no longer remember making.\n\nPerhaps this is why I find it difficult to throw anything away. Or perhaps it is enough to choose a few things carefully and let the rest move on. I am still learning the difference.',
            tags: ['Objects', 'Writing', 'Home'],
            status: 'published',
            featured: false
        }
    ];

    function readPosts() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === null) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(starterPosts));
                return starterPosts;
            }
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : starterPosts;
        } catch {
            return starterPosts;
        }
    }

    function savePosts(posts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    window.AKCWebCraftStore = Object.freeze({ fallbackCover, readPosts, savePosts });
})();