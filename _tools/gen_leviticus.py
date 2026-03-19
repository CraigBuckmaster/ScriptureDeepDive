"""Leviticus chapter generator — LEV-1 through LEV-6."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def lev(ch, data):
    build_chapter('leviticus', ch, data)

# ─────────────────────────────────────────────────────────────────────────────
# LEV-1: Chapters 1–7 — The Sacrifice System
# ─────────────────────────────────────────────────────────────────────────────

lev(1, {
    'title': 'The Burnt Offering: Draw Near to the Lord',
    'sections': [
        {
            'header': 'Verses 1–9 — The Burnt Offering from the Herd',
            'verses': verse_range(1, 9),
            'heb': [
                ('ʿōlāh', 'ʿolah', 'burnt offering / that which goes up', 'From ʿālāh, "to go up." The entire animal ascends to God in smoke — nothing is retained. Signals total consecration.'),
                ('qorban', 'qorban', 'offering / that which is brought near', 'From qārab, "to draw near." Every offering is fundamentally an act of approach to the holy God.'),
                ('rêaḥ nîḥôaḥ', 'reach nihoach', 'pleasing aroma / soothing fragrance', 'Anthropomorphic language for divine acceptance. Signals the worshipper\'s offering is received.'),
            ],
            'ctx': 'Leviticus opens where Exodus ends — God dwelling in the tabernacle (Exod 40:34–38), now calling Israel to draw near through sacrifice. The burnt offering is the foundational sacrifice: it is entirely consumed, symbolising total self-dedication to God. The worshipper lays a hand on the animal\'s head (v.4), identifying with it, and the offering achieves atonement (kippēr). The detailed attention to blood manipulation (vv.5,11,15) underscores that life belongs to God — blood represents life given back to the giver of life.',
            'cross': [
                ('Rom 12:1', 'Paul calls believers to present themselves as "living sacrifices" — the NT counterpart to the ʿōlāh.'),
                ('Heb 10:5–7', 'The Psalmist\'s words applied to Christ: "Offerings you did not desire… here I am." The ʿōlāh finds its fulfilment in total self-offering.'),
                ('Exod 29:18', 'The burnt offering is central to Aaron\'s ordination — the same ritual Lev 8–9 will enact.'),
            ],
            'mac': [
                ('1:1–2', 'MacArthur: The tent of meeting is now the locus of divine speech — God speaks from within the cloud of glory. "Speak to the Israelites" marks the beginning of a new phase: not deliverance from Egypt but instruction in holiness.'),
                ('1:3–4', 'MacArthur: "Without defect" (tāmîm) is the consistency requirement throughout Leviticus. The perfection of the offering foreshadows Christ, the Lamb without blemish (1 Pet 1:19). Laying on of hands identifies worshipper with sacrifice.'),
                ('1:5–9', 'MacArthur: The blood manipulation by priests is not magical — it is covenantal. Blood represents life, and its placement at the altar\'s base signifies the life of the worshipper presented to the covenant Lord.'),
            ],
            'milgrom': [
                ('1:1–2', 'Milgrom: The Tent of Meeting is not merely a sanctuary but a palace — YHWH enthroned as divine king summons his vassal Israel. The sacrificial system is the protocol for approaching the divine sovereign.'),
                ('1:3', 'Milgrom: "Without defect" (tāmîm) carries a cultic-legal sense: the animal must be physically complete. Milgrom notes this is not a moral requirement but a ritual one — the offering must be worthy to stand before divine holiness.'),
                ('1:4', 'Milgrom: Hand-leaning (semikhāh) transfers identity — the worshipper\'s self is symbolically united with the animal. Kippēr here means "to purge" or "to ransom." Milgrom distinguishes this from expiation: it is the worshipper\'s acceptance, not guilt-removal.'),
            ],
            'sarna': [
                ('1:1', 'Sarna: "He called" (wayyiqraʾ) with a small ʾaleph in the Hebrew tradition signals Moses\'s humility — God initiates; Moses receives. The opening verb defines the entire book: God\'s sovereign summons.'),
                ('1:3–9', 'Sarna: The threefold source of burnt offerings — herd, flock, birds — democratises access. The wealthy bring cattle, the middle class sheep or goats, the poor turtledoves. The sacrificial system is not the preserve of the elite.'),
            ],
            'alter': [
                ('1:1', 'Alter: The verb wayyiqraʾ, "he called," is the book\'s first word and its title in Hebrew. This is not incidental. The entire book is God\'s sustained address to Israel — a priestly constitution delivered in the divine voice.'),
                ('1:3–9', 'Alter: The precision of the ritual language — each step enumerated, each action specified — reflects the priest-scribes\' investment in order. Holiness is enacted through exact procedure; chaos is the antithesis of the sacred.'),
            ],
            'calvin': [
                ('1:1–4', 'Calvin: God\'s condescension in accepting animal sacrifice reveals his mercy — he accommodates Israel\'s weakness, giving them tangible means of approach. The ceremonies are shadows pointing to the one true sacrifice.'),
                ('1:5–9', 'Calvin: The blood rites are not empty ceremony but pedagogical — they teach Israel that sin requires death, that life is forfeit before God\'s holiness, and that only by substitution can the guilty draw near.'),
            ],
            'netbible': [
                ('1:1', 'NET Note: The clause "from the tent of meeting" specifies where God\'s speech originates — the newly completed sanctuary. This ties Leviticus narratively to the end of Exodus (40:34–38).'),
                ('1:4', 'NET Note: "Atonement" (kippēr, Piel) is debated. Options: (1) "to cover" (sin); (2) "to wipe clean" (purge); (3) "to ransom." Milgrom\'s "purge/ransom" best fits the Levitical context where kippēr often concerns ritual impurity.'),
            ],
        },
        {
            'header': 'Verses 10–17 — The Burnt Offering from the Flock or Birds',
            'verses': verse_range(10, 17),
            'heb': [
                ('tôr / ben-yônāh', 'tor / ben-yonah', 'turtledove / young pigeon', 'The provision of birds as an acceptable substitute ensures the poorest Israelite can participate in the sacrificial system. Access to God is not proportional to wealth.'),
            ],
            'ctx': 'The chapter\'s structure is deliberately tiered: cattle (vv.3–9), sheep or goats (vv.10–13), birds (vv.14–17). Each tier has slightly different procedures — birds are not slaughtered with a knife but wrung by the neck — yet each achieves the same covenantal result. The democratising logic is striking: no Israelite, however poor, is excluded from approaching God through sacrifice.',
            'cross': [
                ('Luke 2:24', 'Mary and Joseph bring "a pair of turtledoves or two young pigeons" at Jesus\'s presentation — the offering of the poor. The incarnate Son enters under the poverty provision of the sacrificial law.'),
                ('2 Cor 8:9', '"Though he was rich, yet for your sake he became poor." Christ himself draws near under the lowest tier of the offering system.'),
            ],
            'mac': [
                ('1:10–13', 'MacArthur: The flock offering follows identical logic to the herd offering — hand-laying, slaughter, blood manipulation, arrangement on the altar. The repetition is deliberate: same access, different means. The covenant is egalitarian in its structure.'),
                ('1:14–17', 'MacArthur: The bird offering adapts the ritual to the animal\'s anatomy — pinching the head rather than cutting with a knife, tearing the wings rather than dismembering. God\'s law is attentive to the nature of each creature.'),
            ],
            'milgrom': [
                ('1:10–13', 'Milgrom: The variation in animal size (bull to bird) reflects socioeconomic reality. Milgrom notes this is the Torah\'s consistent pastoral concern — the sacrificial system must be accessible. The rich cannot monopolise the sacred.'),
                ('1:14–17', 'Milgrom: The bird ritual is a priestly adaptation. Unlike land animals, birds cannot have hands laid on them — the priest acts on the worshipper\'s behalf throughout. This anticipates the fuller priestly mediation of the later chapters.'),
            ],
            'sarna': [
                ('1:14–17', 'Sarna: The bird offering preserves the essential elements — approach, identification, death, blood — while adapting for the creature\'s size. The underlying theology is constant: life is returned to the giver of life.'),
            ],
            'alter': [
                ('1:14–17', 'Alter: The crispness of the instructions — "wring off the head… drain the blood… remove the crop… tear it open by the wings" — reflects the priestly style at its most characteristic: taxonomy and procedure as modes of sacred order.'),
            ],
            'calvin': [
                ('1:10–17', 'Calvin: Christ is the true burnt offering — wholly given for us, entirely consumed in suffering and death, a fragrance acceptable to God. The diversity of animal offerings prefigures the one sacrifice that encompasses all.'),
            ],
            'netbible': [
                ('1:14', 'NET Note: Bird species here are the standard pair for many Levitical rites (Lev 5:7; 12:8; 14:22; 15:14). Their low cost makes them the standard provision for those unable to afford livestock.'),
                ('1:15', 'NET Note: "Wring off" (mālaQ, Piel) — this verb appears only in Leviticus for the neck-wringing of birds. The distinction from livestock slaughter (šāḥaṭ) indicates different priestly technique for different creatures.'),
            ],
        },
    ],
})

lev(2, {
    'title': 'The Grain Offering: The Firstfruits Belong to God',
    'sections': [
        {
            'header': 'Verses 1–10 — The Raw and Baked Grain Offerings',
            'verses': verse_range(1, 10),
            'heb': [
                ('minḥāh', 'minhah', 'grain offering / gift', 'Originally any gift or tribute (Gen 4:3; 32:14). In Leviticus it narrows to the cereal offering. Signals the produce of human labour presented as tribute to the divine King.'),
                ('sōlet', 'solet', 'fine wheat flour', 'The best-grade flour — sifted, premium quality. Only the finest tribute is fitting for God.'),
                ('qĕmāṣ', 'qemats', 'a handful', 'The representative portion burned on the altar as an ʾazkārāh (memorial/token portion). The rest belongs to Aaron and his sons.'),
            ],
            'ctx': 'The grain offering accompanies the animal offerings as a gift of agricultural produce — the fruit of human labour rather than animal life. It contains no leaven (associated with corruption) and no honey (associated with Canaanite fermented offerings), but always includes salt (the covenant seasoning, v.13) and frankincense. The offering can be raw flour, baked in an oven, on a griddle, or in a pan — five forms in total — reflecting the diversity of Israelite food preparation. The priest burns a representative handful (the ʾazkārāh) and keeps the rest for the priestly household.',
            'cross': [
                ('John 6:35', '"I am the bread of life." The grain offering\'s bread symbolism points forward — Christ is the true bread from heaven, the firstfruits of a new humanity.'),
                ('1 Cor 5:7–8', '"Christ our Passover lamb has been sacrificed. Therefore let us keep the festival — not with the old leaven… but with the unleavened bread of sincerity and truth."'),
                ('Num 15:1–16', 'The grain offering always accompanies animal sacrifices in the wilderness — it is never offered alone as a burnt offering is. It functions as complement, not substitute.'),
            ],
            'mac': [
                ('2:1–3', 'MacArthur: The grain offering acknowledges God as Lord of the harvest — every crop, every loaf, every meal ultimately derives from his provision. Presenting the first and finest is an act of covenant loyalty.'),
                ('2:4–10', 'MacArthur: The five forms of grain offering (raw, oven-baked, griddle, pan, deep-fry) ensure that every method of food preparation can become an act of worship. No sphere of daily life lies outside the sacred.'),
            ],
            'milgrom': [
                ('2:1', 'Milgrom: The minḥāh in Leviticus represents the agricultural tribute a vassal owes a king. Israel as YHWH\'s tenant presents a portion of the land\'s produce — recognition that the land belongs to God, not Israel.'),
                ('2:3', 'Milgrom: The priestly portion (the non-burned remainder) is called "most holy" — the same designation as the Ark and the inner sanctuary. This elevates the priests\' daily food to the level of the sacred; they eat from the altar\'s excess.'),
            ],
            'sarna': [
                ('2:11–13', 'Sarna: The prohibition of leaven and honey, combined with the requirement of salt, reflects the grain offering\'s symbolic language. Leaven = corruption; honey = fermentation/Canaanite connotation; salt = incorruptibility and covenant permanence (cf. Num 18:19, "a covenant of salt forever").'),
            ],
            'alter': [
                ('2:1', 'Alter: The shift from animal to grain opens a new register — not the drama of blood and fire but the quiet presentation of bread. Yet the underlying structure is identical: an act of approach, a token portion ascended to God, a remainder sustaining the priesthood.'),
            ],
            'calvin': [
                ('2:1–10', 'Calvin: The grain offering teaches that our labour and its fruits belong to God. We are stewards, not owners — the field, the harvest, the bread on the table all derive from divine bounty and are rightfully returned in acknowledgement.'),
            ],
            'netbible': [
                ('2:1', 'NET Note: The term minḥāh shifts in meaning across the OT — from "gift/tribute" generically (Gen 4:3) to specifically "grain offering" in the priestly texts. Leviticus 2 establishes its technical cultic sense.'),
                ('2:13', 'NET Note: Salt was the ancient covenant medium — covenants were ratified with a shared salt meal (cf. Ezra 4:14, "we eat the salt of the palace"). The "salt of the covenant" in every grain offering marks each act of worship as a covenant renewal.'),
            ],
        },
        {
            'header': 'Verses 11–16 — The Firstfruits Offering',
            'verses': verse_range(11, 16),
            'heb': [
                ('bikkûrîm', 'bikkurim', 'firstfruits', 'The first and best of the harvest, presented before the rest is used. Acknowledges that all produce comes from God and belongs to him first.'),
                ('ʾazkārāh', 'azkarah', 'memorial portion / token portion', 'The representative portion burned on the altar. From zākar, "to remember" — the portion that causes God to "remember" the worshipper favourably. The rest goes to the priests.'),
            ],
            'ctx': 'The firstfruits offering (vv.14–16) is distinct from the regular grain offering — it uses roasted grain or crushed new grain, offered with oil and frankincense. The principle is consistent: the first and best belongs to God before Israel eats of the harvest. This connects to the broader firstfruits theology running through the Torah — firstborn animals (Exod 13), firstborn sons (Exod 13:2), first grain (Num 15:20–21). The logic: what is first consecrates the whole.',
            'cross': [
                ('1 Cor 15:20', '"Christ has been raised from the dead, the firstfruits of those who have fallen asleep." Paul applies the bikkûrîm theology directly to resurrection — Christ is the firstfruits who consecrates the whole harvest of resurrection.'),
                ('Rom 11:16', '"If the dough offered as firstfruits is holy, so is the whole lump." The firstfruits principle: the first portion consecrates the rest.'),
            ],
            'mac': [
                ('2:14–16', 'MacArthur: The firstfruits offering is an act of faith — presenting the grain before the harvest is complete, trusting God to provide the rest. It is the agricultural equivalent of tithing: relinquishing first to acknowledge God\'s prior claim on all.'),
            ],
            'milgrom': [
                ('2:14', 'Milgrom: The roasted grain (qālî) and crushed grain (gereś) represent the grain at its least processed — raw enough to convey the immediacy of the harvest\'s first yield. The firstfruits offering is temporally urgent: it happens at the threshold of harvest.'),
            ],
            'sarna': [
                ('2:14–16', 'Sarna: The firstfruits offering establishes the harvest cycle as a sacred event. Israel does not simply eat — it first acknowledges the divine giver. The whole agricultural year is framed by liturgical acts of presentation and gratitude.'),
            ],
            'alter': [
                ('2:14', 'Alter: The pairing of oil and frankincense with the roasted grain elevates a simple agrarian act to cultic dignity. The smell of frankincense burning with grain — a fragrance the priests would know through every harvest — becomes the smell of covenant presence.'),
            ],
            'calvin': [
                ('2:14–16', 'Calvin: The firstfruits typify Christ, who is himself the first and best offering — the truly holy one presented to God on behalf of all. In him the harvest of redemption is consecrated.'),
            ],
            'netbible': [
                ('2:14', 'NET Note: "Crushed" (gereś) grain — the term appears only here and Lev 2:16. It likely refers to grain that has been roughly milled or cracked rather than ground to fine flour, appropriate for the raw firstfruits presentation.'),
            ],
        },
    ],
})

lev(3, {
    'title': 'The Fellowship Offering: The Shared Meal with God',
    'sections': [
        {
            'header': 'Verses 1–11 — The Fellowship Offering from the Herd or Flock',
            'verses': verse_range(1, 11),
            'heb': [
                ('zebaḥ šĕlāmîm', 'zebach shelamim', 'fellowship offering / peace offering', 'From šālôm (peace, wholeness, wellbeing). The offering of communion — it is the only sacrifice where the worshipper shares in the meat with the priests and God. The fat goes to God (burned), the breast and thigh to the priests, the rest to the worshipper\'s household.'),
                ('ḥēleb', 'chelev', 'fat / suet', 'The internal fat surrounding the kidneys and liver — the richest, choicest portion. Always burned on the altar; never eaten by Israel (3:17). The best goes to God.'),
            ],
            'ctx': 'The šĕlāmîm is the joyful offering — the sacrificial meal that creates communion between God, priests, and worshippers. Unlike the burnt offering (entirely consumed) or sin offering (priestly portion), the šĕlāmîm is shared: God receives the fat and blood (the life), the priests receive the breast and thigh, and the worshipper\'s family eats the rest in a sacred feast. It is the Old Testament equivalent of Communion. The fat portions (kidneys, liver lobe, the fat covering the organs) must always be burned — the richest part belongs to God, never to human appetite.',
            'cross': [
                ('1 Cor 10:18', '"Consider the people of Israel: do not those who eat the sacrifices participate in the altar?" Paul draws the parallel — eating from the altar creates participation in what was offered.'),
                ('Eph 2:14', '"He himself is our peace (šālôm), who has made the two groups one." Christ is the ultimate šĕlāmîm — the fellowship offering that creates true peace between God and humanity.'),
                ('Ps 22:26', '"The poor will eat and be satisfied… those who seek the Lord will praise him." The šĕlāmîm meal had a redistributive dimension — the poor were invited to eat from the worshipper\'s portion.'),
            ],
            'mac': [
                ('3:1–5', 'MacArthur: The fellowship offering is the most festive of the sacrifices — the only one where the worshipper takes home meat to feast with family and guests. It is a celebration of the covenant relationship, a shared table with God himself.'),
                ('3:9–11', 'MacArthur: The meticulous itemisation of the fat portions — kidney fat, liver appendage, the fat covering the intestines — reflects a priestly anatomy of the sacred. God receives what is richest; his portion is marked by specificity and honour.'),
            ],
            'milgrom': [
                ('3:1', 'Milgrom: The šĕlāmîm is the paradigmatic "tribute meal" — the vassal presents the choicest portions to the king, then eats the rest in the sovereign\'s presence. It dramatises the ongoing covenant relationship: shared table, differentiated portions, joyful fellowship.'),
                ('3:16–17', 'Milgrom: The absolute prohibition of fat and blood (vv.16–17) is among Leviticus\'s most emphatic rulings. Fat belongs to God (the choicest portion); blood belongs to God (life). These prohibitions protect against the human tendency to consume what is holy — to take for oneself what belongs to the divine.'),
            ],
            'sarna': [
                ('3:1', 'Sarna: The šĕlāmîm is not easily translated — "peace offering" captures the shālôm dimension but misses the communal meal aspect. "Communion offering" or "well-being offering" (NJPS) better conveys that it enacts the wholeness of the covenant relationship.'),
            ],
            'alter': [
                ('3:3–5', 'Alter: The priestly writers\' investment in anatomical precision — "the fat covering the entrails… the two kidneys with the fat on them near the loins, and the appendage of the liver" — is not pedantry. It is a theology of the body: every organ is mapped, every fat deposit named, the offering made total and specific.'),
            ],
            'calvin': [
                ('3:1–5', 'Calvin: The peace offering teaches that true peace with God is not mere absence of hostility but active fellowship — a shared life. The sacrificial meal anticipates the Lord\'s Table: broken bread and poured cup, the body and blood of the true šĕlāmîm, creating lasting communion.'),
            ],
            'netbible': [
                ('3:1', 'NET Note: The term šĕlāmîm is grammatically plural and its exact meaning is debated. NJPS renders "sacrifice of well-being." The root š-l-m connects to šālôm (peace/wholeness) and šillēm (to repay/complete) — suggesting an offering that fulfils or completes the covenantal relationship.'),
                ('3:16', 'NET Note: "All the fat belongs to the Lord" establishes a permanent principle reiterated in v.17. The dietary prohibition of fat (ḥēleb) is specifically the internal organ fat — distinct from the muscle fat of meat, which Israel could eat.'),
            ],
        },
        {
            'header': 'Verses 12–17 — The Fellowship Offering from the Goats; Permanent Statute',
            'verses': verse_range(12, 17),
            'heb': [
                ('ḥuqqat ʿôlām', 'chuqqat olam', 'lasting ordinance / permanent statute', 'An unconditional, perpetual divine command. Appears throughout Leviticus to mark regulations that bind every generation in every place — not merely for the wilderness period.'),
            ],
            'ctx': 'The chapter closes with one of Leviticus\'s most emphatic formulas: "This is a lasting ordinance for the generations to come, wherever you live: You must not eat any fat or any blood" (v.17). The prohibition on fat and blood frames the entire fellowship offering theology. Blood represents life — it belongs to God as the giver of life. Fat represents the richest portion — it belongs to God as the worthiest gift. Both must be surrendered. The human meal from the šĕlāmîm is always a remainder, a gracious share from God\'s own table.',
            'cross': [
                ('Acts 15:20', 'The Jerusalem Council requires Gentile believers to abstain from blood — maintaining one element of the Levitical blood prohibition in the new covenant context.'),
                ('Gen 9:4', '"You must not eat meat that has its lifeblood still in it." The blood prohibition predates Sinai — it is rooted in the Noahic covenant, the foundational charter for all humanity.'),
            ],
            'mac': [
                ('3:17', 'MacArthur: The "lasting ordinance" formula is emphatic — this is not a temporary ceremonial regulation but a permanent theological principle. God\'s claim on life (blood) and on the best (fat) is not abrogated by changed circumstances. The NT fulfilment is Christ\'s blood given for all and his whole self offered as the ultimate ḥēleb.'),
            ],
            'milgrom': [
                ('3:17', 'Milgrom: The absolute prohibition formula (lōʾ tōʾkĕlû, "you shall not eat") and the ḥuqqat ʿôlām stamp signal that this is among Leviticus\'s non-negotiable rulings. Milgrom argues the fat and blood prohibitions together constitute a theology of divine priority: God\'s claim on life and quality precedes every human claim.'),
            ],
            'sarna': [
                ('3:17', 'Sarna: "Throughout your generations, in all your settlements" — the projection into the future and across geography signals the Torah\'s awareness that the sacrificial system will eventually extend beyond the wilderness. These prohibitions travel with Israel wherever Israel goes.'),
            ],
            'alter': [
                ('3:17', 'Alter: The closing formula anchors the sacrifice legislation in the broadest possible frame — all generations, all places. What begins as a wilderness rite is immediately universalised. Holiness is portable.'),
            ],
            'calvin': [
                ('3:16–17', 'Calvin: That God reserves fat and blood for himself is a perpetual reminder that we hold nothing absolutely — our bodies, our food, our very life are held on loan from the Creator. Worship is the acknowledgement of this dependence.'),
            ],
            'netbible': [
                ('3:17', 'NET Note: "Throughout your generations… wherever you live" — the formula is found 15 times in Leviticus, each time extending cultic legislation beyond the immediate Sinai context. The priestly writers understood the law as portable, not geographically bound to the tabernacle site.'),
            ],
        },
    ],
})

lev(4, {
    'title': 'The Sin Offering: Atonement for Unintentional Sins',
    'sections': [
        {
            'header': 'Verses 1–21 — The Sin Offering for the Priest and the Congregation',
            'verses': verse_range(1, 21),
            'heb': [
                ('ḥaṭṭāʾt', 'chatta\'at', 'sin offering / purification offering', 'From ḥāṭāʾ, to miss the mark / to sin. Milgrom argues the primary meaning in Leviticus is "purification offering" — it purges ritual impurity from the sanctuary rather than punishing the sinner.'),
                ('bišgāgāh', 'bishgagah', 'unintentionally / inadvertently', 'From šāgāg, to err/stray. The sin offering covers only unintentional violations — sins committed in ignorance or by accident. Intentional (high-handed) sin is not covered by sacrifice.'),
                ('kippēr', 'kipper', 'to atone / to purge / to ransom', 'The central verb of Levitical sacrifice. Milgrom\'s analysis: in impurity contexts it means "to purge/cleanse"; in guilt contexts it means "to ransom." The goal is always restored covenant access.'),
            ],
            'ctx': 'The sin offering (ḥaṭṭāʾt) is the first explicitly expiatory sacrifice — it addresses sins committed unintentionally (bišgāgāh). Its scope is tiered: the anointed priest who sins requires a young bull (vv.3–12); if the whole community sins, a young bull (vv.13–21); a leader requires a male goat (vv.22–26); an ordinary Israelite requires a female goat or lamb (vv.27–35). The ritual is complex — the blood is applied to the horns of the incense altar (inside the tabernacle) or smeared on the altar of burnt offering (outside), depending on who sinned. The higher the sinner\'s status, the deeper into the sanctuary the blood goes, and the greater the purging required.',
            'cross': [
                ('Heb 9:13–14', '"The blood of goats and bulls… how much more will the blood of Christ… cleanse our consciences from acts that lead to death." The ḥaṭṭāʾt\'s purging logic is fulfilled in Christ\'s blood that cleanses not just the outer sanctuary but the human conscience.'),
                ('Heb 13:11–12', '"The high priest carries the blood of animals into the Most Holy Place as a sin offering, but the bodies are burned outside the camp. And so Jesus also suffered outside the city gate." The sin offering\'s structure maps onto the Passion.'),
                ('2 Cor 5:21', '"God made him who had no sin to be sin (ḥaṭṭāʾt) for us." The Greek ἁμαρτία can be read as "sin offering" — Christ became the ḥaṭṭāʾt itself.'),
            ],
            'mac': [
                ('4:1–2', 'MacArthur: The distinction between intentional and unintentional sin is foundational to Levitical theology. Unintentional sins can be atoned; wilful, defiant sins ("high-handed" sins, Num 15:30–31) place the offender outside the covenant. This distintion survives in Christian theology: sins of weakness vs. sins of deliberate rebellion.'),
                ('4:3–12', 'MacArthur: That the priest\'s sin requires the most costly offering — a young bull — and sends the blood into the sanctuary itself reveals a profound principle: spiritual leadership magnifies responsibility. The priest who sins contaminates the sanctuary; his atonement must therefore address the sanctuary\'s defilement.'),
            ],
            'milgrom': [
                ('4:2', 'Milgrom: The ḥaṭṭāʾt is better translated "purification offering" — its primary function is to purge the sanctuary of the impurity generated by the worshipper\'s sin, not to punish the sinner. Sin creates a moral "stain" that attaches to the sanctuary; the blood of the ḥaṭṭāʾt acts as a detergent, removing that stain.'),
                ('4:3–12', 'Milgrom: The graded scale of offerings (bull for priest/community, goat for leader, female goat/lamb for individual) reflects not graded guilt but graded purification need. The priest\'s sin defiles the inner altar (incense altar); the individual\'s sin defiles only the outer altar. Status determines the location of defilement.'),
            ],
            'sarna': [
                ('4:1–2', 'Sarna: "Unintentionally" (bišgāgāh) encompasses sins committed in ignorance, error, or negligence — not malice. The Torah distinguishes sharply between the inadvertent offender who can be restored and the defiant rebel who "reviles the Lord" (Num 15:30).'),
            ],
            'alter': [
                ('4:3', 'Alter: The phrase "if the anointed priest sins" opens a stunning social observation — even the holiest human being in Israel is capable of sin and requires atonement. Holiness is a gift maintained by ritual, not a permanent personal achievement.'),
            ],
            'calvin': [
                ('4:1–12', 'Calvin: The sin offering\'s complexity teaches that sin is never trivial — even unintentional failures before God require costly atonement. The death of an animal, the blood applied to the altar: these are not empty gestures but tutors pointing to the one death that would truly atone.'),
            ],
            'netbible': [
                ('4:3', 'NET Note: "The anointed priest" refers to the high priest — the only priest anointed with the full anointing oil (Exod 29:7; Lev 8:12). His sin affects the entire community ("bringing guilt on the people") because he represents them before God.'),
                ('4:6', 'NET Note: Sprinkling blood seven times before the veil (seven = completeness) then applying it to the incense altar\'s horns constitutes the most elaborate blood rite in Leviticus — appropriate to the severity of the defilement a priestly sin causes.'),
            ],
        },
        {
            'header': 'Verses 22–35 — The Sin Offering for Leaders and Ordinary Israelites',
            'verses': verse_range(22, 35),
            'heb': [
                ('nāśîʾ', 'nasi', 'leader / prince / chieftain', 'The tribal or clan head — a position of authority below the high priest but above ordinary Israelites. His sin offering (male goat) reflects his intermediate status.'),
            ],
            'ctx': 'The graded sin-offering scale continues: a leader (nāśîʾ) brings a male goat (vv.22–26); an ordinary Israelite (nepeš, "person") brings a female goat (vv.27–31) or female lamb (vv.32–35). The gradation is not moral but ritual — higher status means greater capacity to contaminate the sanctuary, requiring greater purification. In each case the blood is applied to the horns of the outer altar (not the inner incense altar) — the lower-status sin defiles only the outer court. The consistent result in each section is identical: "the priest shall make atonement for them, and they will be forgiven" (vv.20, 26, 31, 35).',
            'cross': [
                ('1 John 1:9', '"If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness." The sin offering\'s promise — confession → atonement → forgiveness — is restated in explicitly NT terms.'),
                ('Ps 32:1–2', '"Blessed is the one whose transgressions are forgiven, whose sins are covered… whose sin the Lord does not count against them." David describes the sin offering\'s result in the language of blessedness.'),
            ],
            'mac': [
                ('4:22–26', 'MacArthur: "When a leader sins unintentionally" — the particle ʾăšer ("when") rather than ʾim ("if") may imply that leadership sin is inevitable, not merely possible. Leaders bear heavier responsibility; they are also more exposed to temptation and more frequent in sin.'),
                ('4:27–35', 'MacArthur: The repeated "they will be forgiven" (wĕnislāḥ) is Leviticus\'s central pastoral promise. The sacrificial system is not merely ritual machinery but a gracious divine provision for restoring broken covenant fellowship. Every sin offering ends in forgiveness.'),
            ],
            'milgrom': [
                ('4:22–35', 'Milgrom: The fourfold repetition of the forgiveness formula (vv.20, 26, 31, 35) is deliberate rhetoric — every reader of every social class is reassured: the system works, the promise holds, forgiveness is available. No class of Israelite is excluded from atonement.'),
            ],
            'sarna': [
                ('4:27', 'Sarna: "A member of the community" (nepeš meʿam hāʾāreṣ) — the ordinary Israelite, neither priest nor leader. The sin offering\'s tiered system reaches its base level here: even the most ordinary person has covenant access to forgiveness.'),
            ],
            'alter': [
                ('4:20', 'Alter: "The priest will make atonement for them, and they will be forgiven" — this terse formula recurs four times in the chapter. Its repetition creates a liturgical rhythm: sin → offering → atonement → forgiveness. The chapter is structured as a pastoral guarantee.'),
            ],
            'calvin': [
                ('4:22–35', 'Calvin: God\'s provision of the sin offering for every level of society reveals his universal mercy. No condition of life lies beyond the reach of his forgiveness. The poorest Israelite, the most obscure individual, is not forgotten in the sacrificial system — God\'s grace is as available to the commonest person as to the high priest.'),
            ],
            'netbible': [
                ('4:31', 'NET Note: "As a soothing aroma to the Lord" (rêaḥ nîḥôaḥ) — this phrase, common in the burnt offering, appears here applied to the fat of the sin offering. It signals divine acceptance: the purging has been effective, the defilement removed, the relationship restored.'),
            ],
        },
    ],
})

lev(5, {
    'title': 'The Guilt Offering: Restitution for Sins Against the Sacred',
    'sections': [
        {
            'header': 'Verses 1–13 — The Graduated Sin Offering for Special Cases',
            'verses': verse_range(1, 13),
            'heb': [
                ('ʾāšam', 'asham', 'guilt / guilty / guilt offering', 'Both the state of culpability and the offering that addresses it. Key cases: (1) failure to testify when required; (2) rash oaths; (3) touching unclean things. The ʾāšam addresses the guilt generated by specific acts.'),
                ('wĕhitwaddāh', 'wethitwaaddah', 'and they shall confess', 'From yādāh in the Hithpael — reflexive acknowledgement of sin. Confession precedes the sacrifice. The offering without confession is empty; confession without offering is incomplete.'),
            ],
            'ctx': 'Leviticus 5:1–13 transitions from the standard sin offering (Lev 4) to a graduated provision for special cases of unintentional sin: failure to testify, touching unclean things, and rash oaths. The provision is remarkable: if a person cannot afford a lamb, two birds will do; if they cannot afford birds, fine flour. The graduated scale (lamb → birds → flour) ensures that poverty cannot bar anyone from atonement. But flour sin offerings have one crucial difference: no frankincense and no oil — they must not resemble the grain offering, which is celebratory.',
            'cross': [
                ('1 John 1:9', 'Confession as prerequisite to forgiveness (v.5) is explicitly carried into NT ethics — "if we confess our sins, he is faithful and just to forgive."'),
                ('Luke 21:1–4', 'The widow\'s offering echoes the graduated scale — the poorest can give the least yet have it fully accepted. The sacrificial system\'s provision for the poor finds its fullest NT expression in Jesus\'s commendation of the widow.'),
            ],
            'mac': [
                ('5:1', 'MacArthur: The sin of silence — failing to testify when one has heard a public oath — is treated as a cultic offence. Legal and ritual systems are intertwined in Leviticus: perjury (or its avoidance) is not merely a social wrong but a violation of the covenant order.'),
                ('5:7–13', 'MacArthur: The graduated scale (lamb → birds → flour) is one of the most pastorally generous provisions in the Torah. God\'s system of atonement is explicitly calibrated to economic reality. The poor are not given inferior forgiveness — the flour offering achieves the same result as the lamb.'),
            ],
            'milgrom': [
                ('5:1–4', 'Milgrom: The three cases in vv.1–4 share a common feature — the person did not know they had sinned (bišgāgāh) until they later recognised it (wĕʾāšēm). The awareness of guilt triggers the obligation. Leviticus\'s sin system is conscience-activated.'),
                ('5:11–13', 'Milgrom: The flour offering as the lowest-grade ḥaṭṭāʾt provokes a hermeneutical question: how can flour purge the sanctuary? Milgrom\'s answer: it is the worshipper\'s intent and confession that activate the purgation; the offering is the vehicle, not the agent.'),
            ],
            'sarna': [
                ('5:5', 'Sarna: The explicit requirement to "confess in what way they have sinned" (wĕhitwaddāh) establishes confessional acknowledgement as a prerequisite for atonement. The offering is not a mechanical transaction — it requires the penitent\'s self-aware participation.'),
            ],
            'alter': [
                ('5:11–13', 'Alter: The flour sin offering is theologically audacious — no animal, no blood, yet "the priest shall make atonement for them… and they shall be forgiven." Leviticus insists that God\'s provision adapts to human capacity. Atonement is not the privilege of the wealthy.'),
            ],
            'calvin': [
                ('5:1–13', 'Calvin: The variety of offerings — from lamb to birds to flour — teaches that God looks not at the outward gift but at the inward contrition. The poor person\'s flour, offered in genuine penitence, is as acceptable as the wealthy person\'s lamb.'),
            ],
            'netbible': [
                ('5:11', 'NET Note: The flour sin offering lacks oil and frankincense — specifically to prevent it resembling the celebratory grain offering (Lev 2). The absence of these ingredients marks the offering as penitential, not festal. Even in the poorest provision, the gravity of sin is maintained.'),
            ],
        },
        {
            'header': 'Verses 14–19 — The Guilt Offering for Sacred Property',
            'verses': verse_range(14, 19),
            'heb': [
                ('ʾāšam', 'asham', 'guilt offering', 'A different sacrifice from the ḥaṭṭāʾt (sin offering) — the ʾāšam specifically addresses violations involving sacred property or the rights of God and neighbour. It always requires restitution plus a 20% penalty, in addition to the ram offering.'),
                ('bĕʿērkĕkā', 'be\'erkecha', 'according to your valuation / in silver shekels', 'The guilt offering has a monetary component — the offender must pay the assessed value of the sacred item misappropriated plus 20%, to the priest. It is both a sacrificial and a legal proceeding.'),
            ],
            'ctx': 'The guilt offering (ʾāšam) is distinct from the sin offering in a crucial way: it always involves restitution. If an Israelite inadvertently misappropriates sacred things (qodšê yhwh — tithes, firstfruits, dedicated items), they must: (1) bring a ram without defect of assessed value; (2) repay the full value; (3) add a 20% penalty. The guilt offering is not merely ritual — it is restorative justice applied to the sacred realm. What was taken from God\'s domain must be fully returned, with interest.',
            'cross': [
                ('Luke 19:8', 'Zacchaeus: "I will pay back four times the amount." While exceeding the Levitical 20% restitution requirement, Zacchaeus\'s response embodies the ʾāšam principle — repentance includes tangible restitution.'),
                ('Isa 53:10', '"The Lord makes his life an ʾāšam (guilt offering)." Isaiah applies the guilt offering vocabulary directly to the Servant\'s death — Christ becomes the definitive ʾāšam, making full restitution for what humanity has taken from God.'),
            ],
            'mac': [
                ('5:14–16', 'MacArthur: The 20% surcharge (plus the ram) distinguishes the guilt offering from mere atonement — it is compensatory justice. God\'s sacred things despoiled must be restored with interest. This principle survives in the NT: repentance that does not address material wrong is incomplete.'),
                ('5:17–19', 'MacArthur: "Even though they did not know it" — the guilt offering applies even when the violator is unaware of the transgression. Ignorance mitigates culpability but does not eliminate the obligation to make right. The restoration of God\'s honour requires action regardless of the offender\'s knowledge.'),
            ],
            'milgrom': [
                ('5:14–16', 'Milgrom: The guilt offering is Leviticus\'s most complex sacrifice because it straddles ritual and civil law. The ram is the cultic element (addressing the divine relationship); the restitution + 20% is the civil element (addressing the material wrong). Both are required — neither alone is sufficient.'),
                ('5:17–19', 'Milgrom: The "suspected guilt" case (vv.17–19) introduces a fascinating provision: someone who suspects they may have violated sacred property, without knowing for certain, must bring the guilt offering. Doubt about wrongdoing is itself actionable. The system protects the sacred even against unknown violations.'),
            ],
            'sarna': [
                ('5:14–16', 'Sarna: The combination of sacrifice and monetary restitution reflects the Torah\'s integrated view of religion and ethics — the ritual and the moral cannot be separated. Atonement before God and justice toward God\'s domain go hand in hand.'),
            ],
            'alter': [
                ('5:15', 'Alter: "Valued in silver shekels according to the sanctuary shekel" — the intrusion of monetary valuation into the ritual sphere is distinctively priestly. The sanctuary has its own economy; its disruption requires measurable, accountable redress.'),
            ],
            'calvin': [
                ('5:14–19', 'Calvin: The guilt offering teaches that sin against God is never without cost — it must be repaired, not merely regretted. The addition of the 20% surcharge signifies that repentance involves more than the return of what was wrongly taken; it involves acknowledging the wrong through sacrificial generosity.'),
            ],
            'netbible': [
                ('5:16', 'NET Note: The 20% (literally "one-fifth," ḥomešô) addition appears also in Lev 22:14; 27:13, 15, 19 — always in contexts of restoring what belongs to the sacred domain. It is a standard Torah penalty for unauthorised use of consecrated property.'),
            ],
        },
    ],
})

lev(6, {
    'title': 'Priestly Procedures: The Altar Fire and the Offerings',
    'sections': [
        {
            'header': 'Verses 1–7 — The Guilt Offering for Wrongs Against Neighbours',
            'verses': verse_range(1, 7),
            'heb': [
                ('māʿal māʿal', 'ma\'al ma\'al', 'to commit a trespass / to act unfaithfully', 'The doubling intensifies: deliberate covenant violation, particularly in matters of trust. Covers fraud, false oaths, extortion. When a wrong against a neighbour is also a wrong against God (because the oath was sworn in God\'s name), the ʾāšam applies.'),
                ('rōʾšô', 'ro\'sho', 'its principal / its capital', 'The original sum of the wrong. The guilt offering requires full restitution of the principal plus 20%, in addition to the sacrificial ram.'),
            ],
            'ctx': 'Leviticus 6:1–7 (Heb 5:20–26) extends the guilt offering to interpersonal wrongs: fraud, extortion, theft, false findings, and false oaths. The critical insight is the double wrong — defrauding a neighbour is simultaneously sinning against God, because the deception typically involves a false oath sworn in God\'s name. This unifies the ritual and ethical dimensions: the same guilt offering covers both the offence against God (requiring priestly atonement) and the offence against neighbour (requiring full restitution + 20% on the day of the guilt offering). The system integrates worship and ethics.',
            'cross': [
                ('Matt 5:23–24', '"If you are offering your gift at the altar and there remember that your brother or sister has something against you… first go and be reconciled." Jesus reflects the Levitical principle: sacrifice without reconciled relationships is hollow.'),
                ('Luke 19:8', 'Zacchaeus restores fourfold — exceeding the ʾāšam requirement — as the embodiment of genuine repentance that includes material restitution.'),
            ],
            'mac': [
                ('6:1–5', 'MacArthur: The expansion of the guilt offering to interpersonal wrongs is theologically significant: cheating a neighbour is simultaneously cheating God. In a covenant community, every human relationship is undergirded by the divine covenant — to violate one is to violate the other.'),
                ('6:6–7', 'MacArthur: Restitution must precede (or accompany) the offering — making it right with the neighbour is part of making it right with God. The guilt offering without prior restitution would be ritually performative but morally empty.'),
            ],
            'milgrom': [
                ('6:2–5', 'Milgrom: The list of offences — deposit fraud, robbery, extortion, theft, false finding, false oath — are all violations of property rights within the covenant community. Milgrom notes that all involve denial (kāḥaš, "to deceive/lie") — the common thread is a false assertion, particularly under oath.'),
                ('6:5', 'Milgrom: "On the day they present their guilt offering" — the restitution and the sacrifice are simultaneous. The guilt offering is a single complex act: pay back + pay forward (the ram). Neither alone completes the atonement.'),
            ],
            'sarna': [
                ('6:1–7', 'Sarna: The integration of civil and sacred law here is characteristic of the Torah\'s ethical vision: there is no compartmentalisation between "religious" and "secular" wrong. The covenant encompasses economics, property, oath-keeping, and sacrifice in a single framework.'),
            ],
            'alter': [
                ('6:2', 'Alter: The verb māʿal (trespass/unfaithfulness) carries the connotation of betraying trust — it is used of marital infidelity (Num 5:12) and of Israel\'s apostasy. Cheating a neighbour in business is a form of covenant infidelity, not merely an economic crime.'),
            ],
            'calvin': [
                ('6:1–7', 'Calvin: God links the altar and the marketplace — cheating a neighbour defiles the same relationship that the guilt offering is designed to restore. There is no piety that coexists with fraud. The sacrifice that follows dishonest gain is rejected before it begins.'),
            ],
            'netbible': [
                ('6:2', 'NET Note: "Deceiving" (kāḥaš) + "acting unfaithfully" (māʿal) — the combination suggests not merely an act but a disposition: someone who habitually misrepresents themselves in economic dealings. The Torah addresses character, not merely isolated acts.'),
            ],
        },
        {
            'header': 'Verses 8–23 — The Altar Fire and Priestly Procedures for the Burnt and Grain Offerings',
            'verses': verse_range(8, 23),
            'heb': [
                ('tôrat', 'torat', 'law / instruction of', 'The term used for each of the priestly regulations in Lev 6–7: "this is the tôrāh of the burnt offering… the grain offering… the sin offering." Tôrāh means "instruction/direction" — priestly rulings for proper ritual.'),
                ('ʾēš tāmîd', 'esh tamid', 'continual fire / perpetual fire', 'The fire on the altar of burnt offering must never go out (v.13). This requirement establishes the tabernacle as a perpetually active sanctuary — always ready to receive offerings, always burning, always open.'),
            ],
            'ctx': 'Leviticus 6:8–7:38 shifts register: from the worshipper\'s perspective (what to bring and why) to the priest\'s perspective (how to handle what is brought). The "tôrāh of the burnt offering" (6:9), grain offering (6:14), sin offering (6:25), guilt offering (7:1), and fellowship offering (7:11) are priestly manuals — specific instructions for handling each sacrifice, managing the portions, maintaining the altar fire. The perpetual fire (v.13) is a striking image: the altar is never cold, never unready. God\'s presence is always accessible. The priestly garments for ash-removal (vv.10–11) and the baked grain offering for priestly ordination (vv.19–23) reflect the thoroughness of the priestly system.',
            'cross': [
                ('Rev 8:3–4', '"Another angel… was given much incense to offer… The smoke of the incense, together with the prayers of God\'s people, went up before God from the angel\'s hand." The perpetual altar fire of Leviticus becomes the perpetual incense of the heavenly altar — always burning, prayers always ascending.'),
                ('Heb 7:24–25', '"Because Jesus lives forever… he is able to save completely those who come to God through him, because he always lives to intercede for them." The tāmîd (perpetual) principle — the altar never goes cold — is fulfilled in Christ\'s unceasing intercession.'),
            ],
            'mac': [
                ('6:12–13', 'MacArthur: The perpetual fire is a powerful theological symbol — God\'s altar is never extinguished, never unavailable. The fire first kindled by divine act (Lev 9:24) must be maintained by priestly diligence. Grace initiates; human faithfulness sustains.'),
                ('6:19–23', 'MacArthur: The high priest\'s daily grain offering — half in the morning, half in the evening — is entirely burned. He who supervises all other offerings makes no profit from any of them; his own contribution is wholly given. Leadership in the priestly system models total sacrifice.'),
            ],
            'milgrom': [
                ('6:9–11', 'Milgrom: The ashes (dešen) of the burnt offering are treated with reverence — the priest dresses in specific garments to remove them, carries them outside the camp. Even the residue of sacrifice is holy. The altar\'s dignity extends to everything it touches.'),
                ('6:12–13', 'Milgrom: The "perpetual fire" requirement distinguishes Israel\'s altar from the fire shrines of surrounding cultures, where fires were lit and extinguished as cultic events. YHWH\'s altar is permanently active — his presence is never suspended, his readiness to receive never interrupted.'),
            ],
            'sarna': [
                ('6:8–18', 'Sarna: The shift to priestly procedure signals that Leviticus is aware of its audience — not just the worshipping Israelite but the priests who must execute the system flawlessly. The tôrôt of chapters 6–7 are professional handbooks as much as theological texts.'),
            ],
            'alter': [
                ('6:13', 'Alter: "The fire must be kept burning on the altar continuously; it must not go out" — the thrice-stated imperative (vv.9, 12, 13) creates a rhythmic insistence. The perpetual fire is not a rule but a liturgical drumbeat: never cold, never dark, never closed.'),
            ],
            'calvin': [
                ('6:12–13', 'Calvin: The perpetual fire typifies the Holy Spirit — the divine fire never extinguished in the church. As the physical fire was to be fed and maintained by human diligence, so the Spirit\'s fire must be fed by prayer, worship, and the means of grace. Quench not the Spirit (1 Thess 5:19).'),
            ],
            'netbible': [
                ('6:13', 'NET Note: The three-fold repetition of the command in vv.9, 12, 13 uses the negated jussive with tāmîd — the strongest possible form of the prohibition: "the fire shall not be extinguished." The priestly compiler marks this as foundational to the entire sacrificial system\'s operation.'),
            ],
        },
        {
            'header': 'Verses 24–30 — The Priestly Procedures for the Sin Offering',
            'verses': verse_range(24, 30),
            'heb': [
                ('qōdeš qŏdāšîm', 'qodesh qodashim', 'most holy / holy of holies', 'The superlative of holiness in Hebrew (doubling the noun). Applied to the sin offering in 6:25 — the priest\'s portion of the sin offering is "most holy." Contact with it transfers holiness (v.27) and demands careful handling.'),
                ('yĕkabbēs', 'yekabbes', 'he shall wash / launder', 'The sin offering\'s blood, if it spatters on a garment, must be laundered — the transferred holiness requires cleansing before the garment re-enters ordinary use. Earthenware vessels that absorb the sin offering\'s residue must be broken.'),
            ],
            'ctx': 'The sin offering priestly instructions reveal a striking property of the sacrifice: the ḥaṭṭāʾt is "most holy" (qōdeš qŏdāšîm), and holiness in Leviticus is contagious. Blood spatters on a garment → launder it. Liquid absorbed by earthenware → shatter the pot. Bronze vessels → scour them. The reason (v.29b): "Whatever touches their flesh will become holy." The sin offering that purges the sanctuary carries holiness outward from the altar — it cannot re-enter ordinary use without careful ritual transition. This holiness-contagion principle governs much of Leviticus.',
            'cross': [
                ('1 Cor 11:27–29', '"Whoever eats the bread or drinks the cup of the Lord in an unworthy manner will be guilty of sinning against the body and blood of the Lord." The NT Lord\'s Supper carries the same "most holy" logic — contact with what is most holy creates heightened accountability.'),
                ('Heb 9:14', '"How much more… will the blood of Christ cleanse our consciences." The sin offering\'s blood as the supreme cleansing agent finds its anti-type in Christ\'s blood — the ultimate qōdeš qŏdāšîm.'),
            ],
            'mac': [
                ('6:24–30', 'MacArthur: The "most holy" status of the sin offering is paradoxical: the sacrifice that deals with the most impure thing (sin) is itself the most holy. Holiness in Leviticus is not contaminated by contact with impurity — it overcomes and cleanses it. This prefigures Christ, who touched lepers, ate with sinners, and became sin — yet remained holy.'),
            ],
            'milgrom': [
                ('6:27–28', 'Milgrom: The holiness-contagion of the sin offering is one of Leviticus\'s most distinctive features. The ḥaṭṭāʾt blood, which purges the altar, carries a holy charge that must be properly managed. Earthenware absorbs impurity (and holiness) into its porous clay — hence it must be broken. Bronze can be scoured clean.'),
            ],
            'sarna': [
                ('6:30', 'Sarna: The rule that sin offerings whose blood is taken into the sanctuary must be entirely burned (not eaten) distinguishes the higher-grade sin offerings (priest, community) from the lower-grade ones (leader, individual). The higher the status of the sinner, the deeper the purging required — and the less the priests can benefit.'),
            ],
            'alter': [
                ('6:27', 'Alter: "Whatever touches their flesh will become holy" — the holiness of the sin offering is physically transferable, like an electric charge. Leviticus\'s priestly worldview maps the sacred in spatial, material, and tactile terms. Holiness is not merely spiritual; it has texture and weight.'),
            ],
            'calvin': [
                ('6:24–30', 'Calvin: The elaborate precautions around the sin offering\'s residue teach the gravity of dealing with holy things. We ought not to approach the sacraments or the worship of God casually — the New Testament\'s warnings about unworthy communion (1 Cor 11) echo Leviticus\'s insistence that the most holy demands the most careful handling.'),
            ],
            'netbible': [
                ('6:28', 'NET Note: The earthenware pot requirement (break it) vs. bronze pot (scour and rinse it) reflects practical knowledge of material properties — porous clay absorbs liquids and cannot be fully cleansed; non-porous metal can. The priestly system integrates material science with theological principle.'),
            ],
        },
    ],
})

lev(7, {
    'title': 'The Guilt and Fellowship Offerings: Priestly Portions and Prohibitions',
    'sections': [
        {
            'header': 'Verses 1–21 — The Guilt Offering and Fellowship Offering Procedures',
            'verses': verse_range(1, 21),
            'heb': [
                ('tĕrûmāh', 'terumah', 'contribution / wave offering / raised offering', 'From rûm, to be high/lift up. The portion of the sacrifice "lifted" or "set apart" for the priest. The breast of the fellowship offering is the priest\'s tĕrûmāh — waved before the Lord (elevated, then given to the priests).'),
                ('šôq', 'shoq', 'thigh / leg', 'The right thigh of the fellowship offering goes to the officiating priest as his personal portion. The breast goes to all Aaron\'s sons; the thigh goes specifically to the priest who offers the sacrifice.'),
            ],
            'ctx': 'The guilt offering (ʾāšam) priestly procedures mirror the sin offering: most holy, eaten in the courtyard, all males of the priestly line. The fellowship offering (šĕlāmîm) procedures are more elaborate because the meal is shared three ways (God / priests / worshipper). Three types of fellowship offering are distinguished: thanksgiving (tôdāh, the most urgent — eat same day); vow (neder); voluntary (nĕdābāh, most relaxed — two days allowed). The fat and blood prohibitions of 3:17 are reinforced (vv.22–27). The dedication of the wave-breast and heave-thigh to the priests (vv.30–34) establishes the ongoing priestly income from the sacrificial system.',
            'cross': [
                ('Phil 4:6', '"In every situation, by prayer and petition, with thanksgiving, present your requests to God." The tôdāh (thanksgiving offering) as the most urgent fellowship offering — bring it immediately, eat it today — models Paul\'s call to pray with thanksgiving in every circumstance.'),
                ('Heb 13:15', '"Through Jesus, therefore, let us continually offer to God a sacrifice of praise — the fruit of lips that openly profess his name." The "sacrifice of praise" language derives from the tôdāh — the Psalms\' "thank offering" vocabulary is NT praise.'),
            ],
            'mac': [
                ('7:11–15', 'MacArthur: The thanksgiving offering\'s same-day rule is striking — the most festive and most urgent offering must be consumed entirely on the day it is offered. Gratitude has an immediacy that cannot be deferred. Praise must be expressed while it is felt.'),
                ('7:16–21', 'MacArthur: The two-day rule for vow and voluntary offerings reflects their different character — they are deliberate, pre-planned acts of devotion rather than spontaneous responses to blessing. Even so, by day three the meat must be destroyed. The fellowship offering is fundamentally present-tense — it cannot be stockpiled.'),
            ],
            'milgrom': [
                ('7:12–15', 'Milgrom: The tôdāh (thanksgiving) is the most common fellowship offering in the Psalms and the most theologically rich. Milgrom notes it is frequently associated with deliverance from crisis (Pss 22; 107) — a vow fulfilled after rescue. It is the sacrifice of answered prayer.'),
                ('7:18', 'Milgrom: "Piggul" (pîggûl, "desecrated/abhorrent") — the technical term for an offering invalidated by improper intention, specifically by intending to eat it beyond the permitted time. The offering is rejected as if it had never been offered; the worshipper incurs guilt. Intention as well as action governs the sacrificial system.'),
            ],
            'sarna': [
                ('7:11–18', 'Sarna: The three grades of fellowship offering (thanksgiving, vow, voluntary) create a graduated theology of response to God: immediate thanksgiving for specific deliverance; deliberate vow-fulfilment; and spontaneous, non-obligatory devotion. Together they cover the full range of motivated worship.'),
            ],
            'alter': [
                ('7:15', 'Alter: "Not leave any of it until morning" — the thanksgiving offering\'s urgency is built into its structure. Gratitude spoils like unleavened bread: it must be consumed while fresh. The priestly system understands the psychology of devotion.'),
            ],
            'calvin': [
                ('7:11–21', 'Calvin: The fellowship offering\'s varieties — thanksgiving, vow, voluntary — teach that worship encompasses the whole range of our relationship with God: joyful response, solemn promise, and free-will devotion. No single form of worship exhausts the richness of covenant life before God.'),
            ],
            'netbible': [
                ('7:15', 'NET Note: "Not leave any of it until morning" — a rule also applied to the Passover lamb (Exod 12:10). The same-day requirement prevents the sacred food from becoming ritually stale or subject to corruption; it maintains the freshness and totality of the offering.'),
                ('7:18', 'NET Note: Pîggûl is a hapax legomenon in this specific form and its etymology is disputed. The concept it describes — offering invalidated by improper thought about when to eat it — reveals Leviticus\'s sophisticated concern with intentionality in worship.'),
            ],
        },
        {
            'header': 'Verses 22–38 — Fat and Blood Prohibitions; the Priestly Portions Established',
            'verses': verse_range(22, 38),
            'heb': [
                ('nĕkārat', 'nekarat', 'cut off / excised from the people', 'The kārēt penalty — the most severe consequence in Leviticus, applied to those who violate the fat and blood prohibitions. Scholars debate whether kārēt means divine cutting off (premature death), exclusion from the covenant community, or eschatological destruction.'),
                ('ḥāzeh hatĕnûpāh', 'chazeh hatenuphah', 'the breast of the elevation offering', 'The priestly portion of the fellowship offering — specifically designated for all Aaron\'s sons (the entire priestly line). The elevation/wave motion (tĕnûpāh) signifies presentation to God before being given to the priests.'),
            ],
            'ctx': 'The chapter closes the entire sacrifice manual (Lev 1–7) with two prohibitions and an allocation. The fat and blood prohibitions (vv.22–27) are reinforced with the strongest penalty: kārēt (being "cut off"). Then the fellowship offering\'s priestly portions are formally established (vv.28–36): the breast belongs to all Aaron\'s sons (vv.30–31); the right thigh belongs specifically to the officiating priest (vv.32–34). These are described as Israel\'s "contribution to the Lord from their fellowship offerings" (v.34) — permanent, legal portions belonging to the priests. The summary formula (vv.37–38) ties all seven chapters together as the tôrôt given at Sinai.',
            'cross': [
                ('1 Cor 9:13–14', '"Those who work in the temple get their food from the temple, and those who serve at the altar share in what is offered on the altar. In the same way, the Lord has commanded that those who preach the gospel should receive their living from the gospel."'),
                ('Gal 3:13', '"Christ redeemed us from the curse of the law" — including the kārēt curse. Those who violate the sacred face being cut off; those in Christ have the kārēt penalty borne by the one who became a curse for us.'),
            ],
            'mac': [
                ('7:22–27', 'MacArthur: The kārēt penalty for eating fat or blood is the strongest enforcement mechanism in Leviticus. It underscores that the fat/blood prohibitions are not ceremonial but covenantal — violations strike at the theological heart of the sacrificial system (God\'s claim on life and quality).'),
                ('7:28–36', 'MacArthur: The formal establishment of priestly portions (breast and thigh) from the fellowship offering is the Torah\'s provision for the priesthood\'s material support. The Levites receive no land inheritance; instead God designates portions from every Israelite\'s fellowship offering as their income. The system is sustainable because it is tied to Israel\'s ongoing worship.'),
            ],
            'milgrom': [
                ('7:25–27', 'Milgrom: The kārēt penalty applied to fat and blood violations is disproportionate only if the prohibitions are read as dietary laws. Milgrom reads them as theological: the fat (richest portion) and blood (life) belong to God unconditionally. To consume them is to claim divine prerogatives for oneself — an act of sacrilege, not merely dietary infraction.'),
                ('7:37–38', 'Milgrom: The summary formula closing the sacrifice manual is a colophon — a scribal notation marking the end of a collection. "These are the regulations… which the Lord gave Moses on Mount Sinai" grounds the entire sacrificial system in the Sinai revelation, not in priestly tradition or custom.'),
            ],
            'sarna': [
                ('7:34', 'Sarna: "I have taken the breast that is presented and the thigh that is contributed and given them to Aaron the priest and his sons." The passive construction ("I have taken") frames the priestly portions as divine gift — God takes from the worshipper\'s offering and gives to the priests. The priesthood is sustained by divine allocation, not human generosity.'),
            ],
            'alter': [
                ('7:37–38', 'Alter: The closing summary is the most explicit colophon in Leviticus — seven offerings named, location specified (Mount Sinai), recipient identified (Moses), occasion noted (the day God commanded the Israelites to bring their offerings). It marks a major editorial boundary and frames chapters 1–7 as a complete literary unit.'),
            ],
            'calvin': [
                ('7:22–27', 'Calvin: The fat and blood prohibitions, with their severe kārēt penalty, demonstrate that not all of God\'s commands carry equal weight — some strike at the foundation of the covenant itself. The Christian who treats all of God\'s commands as equally negotiable misunderstands the Levitical logic of graduated holiness.'),
            ],
            'netbible': [
                ('7:25', 'NET Note: "The fat of an animal that may be offered as a food offering" — the prohibition applies specifically to fat from sacrificial animals (cattle, sheep, goats), not to fat from game animals. The fat prohibition is cultic, not universally dietary.'),
                ('7:37–38', 'NET Note: The colophon formula parallels similar editorial summaries in Exodus (31:18; 34:32). The priestly writers use such formulas to mark major compilations — Lev 1–7 is presented as a single legislative unit received at Sinai.'),
            ],
        },
    ],
})

print("LEV-1 complete: Leviticus 1–7 built.")
