export class MediaAnalyzer {
	static analyze(media, store) {
		let tags = {}
		let mediatags = {}
		for (let med of media) {
			const mtags = [...med.caption?.matchAll(/#[\w\dąćęłńóśźżĄĆĘŁŃÓŚŹŻ_]+/g)].map(a => a[0])
			mediatags[med.id] = mtags
			for (let tag1 of mtags) {
				if (!tags[tag1]) tags[tag1] = { count: 0, with: {} }
				tags[tag1].count++;
				for (let tag2 of mtags) {
					if (tag1 === tag2) continue
					tags[tag1].with[tag2] = (tags[tag1].with[tag2] || 0) + 1;
				}
			}
		}
		for (let tag in tags) {
			let tagd = tags[tag]
			tagd.with_ordered = Object.keys(tagd.with).sort((a, b) => tagd.with[b] - tagd.with[a])
		}
		return { mediatags: mediatags, tags: tags }
	}
}
