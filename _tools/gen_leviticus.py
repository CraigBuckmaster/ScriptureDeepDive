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

# ─────────────────────────────────────────────────────────────────────────────
# LEV-2: Chapters 8–10 — The Ordination of Aaron; Nadab and Abihu
# ─────────────────────────────────────────────────────────────────────────────

lev(8, {
    'title': 'The Ordination of Aaron: Clothed, Anointed, Consecrated',
    'sections': [
        {
            'header': 'Verses 1–17 — The Washing, Clothing, and Anointing',
            'verses': verse_range(1, 17),
            'heb': [
                ('qiddēš', 'qiddesh', 'to consecrate / to make holy', 'Piel of qādaš — causative holiness. Moses acts as the agent who transfers God\'s holiness to Aaron and the sanctuary furnishings. Consecration is divinely initiated; humanly enacted.'),
                ('miṣwāh', 'mitzvah', 'commandment / command', 'Seven times in Lev 8–9 the formula appears: "as the Lord commanded Moses." The ordination is not priestly invention but divine choreography — every movement ordered from Sinai.'),
            ],
            'ctx': 'Leviticus 8 enacts what Exodus 28–29 prescribed — the actual ordination ceremony now that the tabernacle is complete and the sacrificial law delivered. The sequence is precise: assembly of the congregation at the tent entrance (v.3) → Moses washes Aaron and sons (v.6) → dresses Aaron in the high-priestly garments (vv.7–9) → anoints the tabernacle and its contents (v.10) → anoints Aaron (v.12) → dresses Aaron\'s sons (v.13) → sin offering (vv.14–17) → burnt offering (vv.18–21) → ordination offering/ram of installation (vv.22–30) → seven-day confinement. The ceremony takes seven days — the number of completeness — before Aaron can minister.',
            'cross': [
                ('Heb 5:4–5', '"No one takes this honour on himself; he must be called by God, just as Aaron was. In the same way, Christ did not take on himself the glory of becoming a high priest." Aaron\'s call through Moses typifies Christ\'s appointment by the Father.'),
                ('Heb 7:26–27', '"Such a high priest truly meets our need — one who is holy, blameless, pure… Unlike the other high priests, he does not need to offer sacrifices day after day… he sacrificed for their sins once for all when he offered himself."'),
                ('1 Pet 2:9', '"You are a royal priesthood." The NT church participates in the priestly vocation, grounded in the ordination of the one true high priest.'),
            ],
            'mac': [
                ('8:1–5', 'MacArthur: The public nature of the ordination — "assemble the entire community at the entrance to the tent of meeting" — is significant. Priestly authority is not self-appointed but publicly witnessed. The whole congregation testifies to the legitimacy of Aaron\'s ministry.'),
                ('8:6–9', 'MacArthur: The dressing of Aaron follows the exact sequence of Exodus 28 — linen tunic, sash, robe, ephod, breastpiece, Urim and Thummim, turban, gold plate. Each garment speaks: the linen = purity; the ephod\'s twelve stones = representing the twelve tribes before God; the "HOLY TO THE LORD" plate = the high priest bears Israel\'s name into the divine presence.'),
                ('8:10–12', 'MacArthur: The anointing oil is poured generously — "streaming down on Aaron\'s beard" (Ps 133:2). The tabernacle furnishings are anointed before Aaron, establishing that the sanctuary\'s holiness derives from God\'s designation, not from Aaron\'s ministry. Aaron steps into an already-holy space.'),
            ],
            'milgrom': [
                ('8:1–5', 'Milgrom: The ordination ceremony is a liturgical drama with three acts: purification (washing), investiture (clothing), and sanctification (anointing). Together they transfer the candidate from the profane realm into the holy order — a boundary crossing that cannot be reversed except by death or defilement.'),
                ('8:10–12', 'Milgrom: The anointing of the tabernacle before Aaron (v.10 precedes v.12) is theologically deliberate. The sanctuary\'s holiness is objective and prior — Aaron is inducted into a holiness that already exists. He does not generate it; he serves within it.'),
            ],
            'sarna': [
                ('8:6–9', 'Sarna: The detailed vestment sequence mirrors the creation narrative\'s orderly completeness. Each garment named, each accessory specified — the priestly investiture is a liturgical creation, bringing ordered sacred function out of the formless common.'),
            ],
            'alter': [
                ('8:7–9', 'Alter: The clothing of Aaron is rendered with unusual specificity — each garment\'s name, each placement described. The priestly narrative\'s aesthetic of accumulative precision reaches its zenith here: putting on the garments is an act of transformation, each layer adding sacred identity until the man disappears into the office.'),
            ],
            'calvin': [
                ('8:6–12', 'Calvin: The washing, clothing, and anointing of Aaron are shadows pointing to Christ, our true high priest. The washing prefigures baptism; the garments prefigure his perfect righteousness; the oil prefigures the Spirit without measure. Aaron is the type; Christ is the substance.'),
            ],
            'netbible': [
                ('8:8', 'NET Note: The Urim and Thummim — mysterious objects kept in the breastpiece used for divine consultation (1 Sam 14:41–42; 28:6). Their exact nature is unknown; they functioned as a binary oracle. The high priest carried Israel\'s need for divine guidance into the holy of holies.'),
            ],
        },
        {
            'header': 'Verses 18–36 — The Burnt Offering, the Ram of Ordination, and the Seven Days',
            'verses': verse_range(18, 36),
            'heb': [
                ('milluʾîm', 'milluim', 'ordination / installation / filling', 'From mālaʾ, to fill. The ordination offering is literally a "filling" offering — filling Aaron\'s hands with the portions he will subsequently offer. "Filling the hands" is the idiom for induction into priestly office.'),
                ('šebaʿat yāmîm', 'shevat yamim', 'seven days', 'The complete time of ordination — seven as the number of wholeness and completion. Aaron and sons must remain at the tent entrance for the full seven days or they will die (v.35). The threshold is holy; the transition takes the full liturgical week.'),
            ],
            'ctx': 'The ordination offering (ram of installation, vv.22–30) is the most distinctive element: Moses applies blood to Aaron\'s right earlobe, right thumb, and right big toe — the same points applied later to the healed leper (Lev 14:14–17). The ear = consecrated to hear God\'s word; the thumb = consecrated hands for holy work; the toe = consecrated walk before God. Then Moses waves the fat portions and the bread before the Lord — the "wave offering" (tĕnûpāh) — and burns them on the altar. The oil-and-blood mixture is sprinkled on Aaron and his sons, completing the consecration. The seven-day confinement (vv.33–36) creates a liminal period — the priests are neither fully in the common world nor fully active in the sacred. The eighth day (Lev 9) will be the breakthrough.',
            'cross': [
                ('Lev 14:14–17', 'The leper\'s cleansing uses identical blood application points (ear, thumb, toe) as Aaron\'s ordination. The healed leper is symbolically re-inducted into covenant life — restored to the priestly dignity all Israel shares.'),
                ('Jas 1:22–25', '"Do not merely listen to the word… Do what it says." The consecrated ear (hearing) and consecrated hand (doing) together constitute active discipleship — the ordination pattern applied to all believers.'),
            ],
            'mac': [
                ('8:22–24', 'MacArthur: The blood on the earlobe, thumb, and toe consecrates the whole man: the faculty of hearing (word received), the hand (work done), and the walk (life lived). The high priest\'s entire person — input, output, direction — is claimed for sacred use.'),
                ('8:33–36', 'MacArthur: "Do not leave the entrance to the tent of meeting for seven days… or you will die." The penalty underscores the gravity of the transition. To leave prematurely is to treat the holy as ordinary — to cross back across the boundary before the consecration is complete. The seven days are not a ceremony but a transformation.'),
            ],
            'milgrom': [
                ('8:22–30', 'Milgrom: The wave offering (tĕnûpāh) is a presentation gesture — the portions are elevated before the deity and then given to the priest. The combination of Moses\'s role (he waves, then burns) with Aaron\'s role (he receives) dramatises the transfer of priestly function: from the mediator who installed the system to the permanent officiant who will run it.'),
                ('8:33–36', 'Milgrom: The seven-day liminality period is paralleled in ancient Near Eastern ordination rites. The candidate is "betwixt and between" — no longer common, not yet fully holy. The eighth day marks emergence into full priestly function, a threshold moment Lev 9 will dramatise with fire from heaven.'),
            ],
            'sarna': [
                ('8:22–30', 'Sarna: The "filling" of Aaron\'s hands (vv.27–28) — placing the portions in his hands for him to wave — is the literal act that gives the ceremony its Hebrew name. The hands that will henceforth manage Israel\'s approach to God are formally "filled" with the first sacred portion they will ever handle.'),
            ],
            'alter': [
                ('8:23', 'Alter: The tripartite blood application — earlobe, thumb-tip, big toe — is one of the most arresting ritual gestures in Leviticus. The body is mapped as a sacred instrument: the point of hearing, the point of making, the point of walking. Each node is marked with blood — the covenant substance — as if the body itself signs the contract.'),
            ],
            'calvin': [
                ('8:33–36', 'Calvin: The seven-day confinement teaches that entry into sacred ministry is not instantaneous. The candidate must dwell in the threshold, separated from the common life, before assuming holy office. There is no quick path to spiritual leadership — the formation takes time, and rushing it is spiritually fatal.'),
            ],
            'netbible': [
                ('8:23', 'NET Note: The right extremities — earlobe, thumb, toe — are the most exposed points of the body, those most likely to be touched and contaminated. Consecrating these specific points claims the most vulnerable areas for holiness. The same logic governs their use in the leper\'s purification (Lev 14:14).'),
            ],
        },
    ],
})

lev(9, {
    'title': 'The Eighth Day: Fire from Heaven',
    'sections': [
        {
            'header': 'Verses 1–21 — The First Offerings of the Newly Ordained Priesthood',
            'verses': verse_range(1, 21),
            'heb': [
                ('bayyôm haššĕmînî', 'bayyom hashemini', 'on the eighth day', 'The ordinal "eighth" signals new beginning — beyond the seven of completeness, into a new order. The eighth day is the day of circumcision (Lev 12:3), of the leper\'s final purification (Lev 14:23), and here of the priesthood\'s inauguration. Eight = the day beyond the sabbatical week, the day of new creation.'),
                ('kābôd yhwh', 'kevod YHWH', 'the glory of the Lord', 'The divine presence in its visible, weighty, luminous manifestation. It "appeared to all the people" (v.23) at the climax of the chapter — the payoff for the entire sacrificial legislation from Lev 1 onward.'),
            ],
            'ctx': 'The eighth day is the inaugural moment of Israel\'s priesthood — the first time Aaron (not Moses) officiates at the altar. The sequence mirrors the Lev 1–7 sacrifice order: sin offering first (vv.8–11), burnt offering (vv.12–14), then the people\'s sin and burnt offering (vv.15–16), grain offering (v.17), fellowship offering (vv.18–21). Aaron fulfils every command precisely as Moses instructs. The climax is devastating in its beauty: Moses and Aaron enter the tent of meeting, come out, bless the people — "and the glory of the Lord appeared to all the people. Fire came out from the presence of the Lord and consumed the burnt offering and fat portions on the altar." The fire that will burn continuously from this moment forward (Lev 6:13) is divinely kindled. The people shout and fall facedown.',
            'cross': [
                ('2 Chr 7:1–3', 'At the dedication of Solomon\'s temple the same event: "fire came down from heaven and consumed the burnt offering… When all the Israelites saw the fire coming down and the glory of the Lord above the temple, they knelt on the pavement… they worshipped and gave thanks to the Lord." The pattern repeats across centuries.'),
                ('Rev 19:4', '"The twenty-four elders and the four living creatures fell down and worshipped God." The prostration of Israel before the divine fire (v.24) prefigures the universal worship of the Lamb.'),
                ('Acts 2:3', '"They saw what seemed to be tongues of fire that separated and came to rest on each of them." Pentecost replicates the tabernacle inauguration: divine fire descends on God\'s new dwelling — the body of Christ.'),
            ],
            'mac': [
                ('9:1–7', 'MacArthur: Moses\'s instruction to Aaron — "come near to the altar and sacrifice your sin offering and your burnt offering and make atonement for yourself and the people" — establishes the order: priest atones for himself first, then for the people. The high priest who cannot approach God for himself cannot intercede for others. This is the fundamental limitation the letter to the Hebrews presses: only a sinless high priest can make effective intercession.'),
                ('9:22–24', 'MacArthur: The divine fire consuming the altar is God\'s acceptance receipt — proof that the sacrificial system, the ordination, and the priestly service are divinely endorsed. The glory appeared "to all the people" — not to the priesthood alone but to the entire congregation. The covenant between God and Israel is publicly ratified by fire.'),
            ],
            'milgrom': [
                ('9:1', 'Milgrom: "The eighth day" is a liturgical new beginning. Milgrom notes the structural parallel: just as the world was created in seven days and the eighth day inaugurated human history, so the tabernacle was consecrated in seven days and the eighth inaugurated the worship of Israel. The ordination ceremony is a liturgical creation account.'),
                ('9:23–24', 'Milgrom: The divine fire is the theological climax of the entire first nine chapters of Leviticus. The entire sacrificial system exists for this moment — the manifest presence of God dwelling among his people. The fire is not merely supernatural pyrotechnics but the proof of divine acceptance: YHWH has come to live in the tent.'),
            ],
            'sarna': [
                ('9:22–24', 'Sarna: Aaron\'s blessing and Moses\'s blessing together bracket the priestly service — the human mediators frame the divine response. God\'s acceptance comes only after the full human obedience is rendered. The sequence — serve faithfully, then receive the glory — is the Levitical pattern for encountering the divine.'),
            ],
            'alter': [
                ('9:24', 'Alter: "When all the people saw it, they shouted for joy and fell facedown." The Hebrew wayyāronnu wayyippĕlû ʿal-pĕnêhem — joy and prostration simultaneously. The two responses are not contradictory but complementary: the holy provokes both exultation and awe, delight and terror. Rudolf Otto\'s mysterium tremendum et fascinans is enacted in a single verse.'),
            ],
            'calvin': [
                ('9:23–24', 'Calvin: The fire from God\'s presence teaches that acceptable worship is not generated by human effort but ignited by divine grace. Israel did not light the altar fire — God did. This pattern governs all worship: we prepare the offering, but God must kindle it. The Reformation principle that true worship is divinely initiated finds its OT type in the fire from heaven.'),
            ],
            'netbible': [
                ('9:24', 'NET Note: "Shouted for joy" (wayyāronnu) — the verb rānan describes a piercing cry of joy used in worship (Ps 33:1; 98:4). The same verb is used for the shouts at the laying of the Second Temple\'s foundation (Ezra 3:12). The divine fire provokes the most intense liturgical cry the Hebrew vocabulary possesses.'),
            ],
        },
        {
            'header': 'Verses 22–24 — The Glory Appears; Fire from the Presence of the Lord',
            'verses': verse_range(22, 24),
            'heb': [
                ('wattēṣēʾ ʾēš', 'wattetzeh esh', 'and fire came out', 'The fire is not a burning coal carried by a priest but a direct emanation from the divine presence — initiating the perpetual altar fire of 6:13. No human hand kindled it. It is God\'s own response to obedient priestly service.'),
            ],
            'ctx': 'These three verses are the climax of Leviticus 1–9 — nine chapters of instruction, ordination, and preparation all pointing to this moment: the glory of the Lord appearing to the whole congregation, and fire coming from his presence to consume the offering. The people\'s response — shouting and falling facedown — is the first recorded congregational act of worship at the tabernacle. The fire that descends here is the same fire that must never go out (6:13). It is the fire of divine presence permanently resident among Israel.',
            'cross': [
                ('Exod 40:34–35', 'The cloud covering the tent and the glory filling the tabernacle at its completion — now followed by the fire of acceptance. The glory comes first to dwell (Exod 40); then the fire confirms the acceptance of service (Lev 9).'),
                ('John 1:14', '"The Word became flesh and made his dwelling (eskēnōsen — tabernacled) among us. We have seen his glory." The incarnation is the ultimate tabernacle inauguration; Christ is the true dwelling of God\'s glory.'),
            ],
            'mac': [
                ('9:22–24', 'MacArthur: Aaron\'s raised hands in blessing (v.22) — the priestly blessing posture of Num 6:24–26 — anticipates the Aaronic blessing that will shape Israel\'s worship for millennia. The high priest raises his hands over the people in the gesture of bestowing what only God can give: peace, grace, and the turned face of God himself.'),
            ],
            'milgrom': [
                ('9:22–24', 'Milgrom: The glory-fire sequence completes Leviticus\'s foundational theological statement: YHWH accepts the priestly service, ratifies the sacrificial system, and takes up residence in the midst of Israel. This is the payoff of the entire Sinai revelation — not primarily ethical commandment but the establishment of divine habitation among human beings.'),
            ],
            'sarna': [
                ('9:23', 'Sarna: Moses and Aaron entering the tent together (v.23) and emerging to bless the people represents the transfer of priestly authority. Moses, who has acted as priest throughout the ordination week, formally hands off the office to Aaron. The blessing they give together marks the last joint action of the two; henceforth Aaron presides at the altar.'),
            ],
            'alter': [
                ('9:22–24', 'Alter: The three-verse climax is Leviticus at its most dramatic — the entire preceding liturgical legislation compressed into a single incandescent moment. Blessing, glory, fire, shout, prostration: five events in rapid succession, each building on the last, each unavailable without all that precedes it in chapters 1–9.'),
            ],
            'calvin': [
                ('9:22–24', 'Calvin: The people falling facedown is the appropriate response to unveiled holiness. We are trained in our age to treat God with familiarity; Leviticus teaches the other dimension — the holy provokes awe, even terror. The fire is not comfortable but consuming; the glory is not decorative but overwhelming. Both responses — joy and prostration — are necessary for full-orbed worship.'),
            ],
            'netbible': [
                ('9:23', 'NET Note: Moses and Aaron entering together then emerging together models the partnership of prophetic and priestly mediation in Israel — Moses the lawgiver and Aaron the priest together represent the two modes of God\'s approach to Israel: word and rite, teaching and sacrifice. Their joint blessing seals the inaugural day.'),
            ],
        },
    ],
})

lev(10, {
    'title': 'Nadab and Abihu: Strange Fire Before the Lord',
    'sections': [
        {
            'header': 'Verses 1–11 — The Death of Nadab and Abihu; Aaron\'s Silence',
            'verses': verse_range(1, 11),
            'heb': [
                ('ʾēš zārāh', 'esh zarah', 'unauthorised fire / strange fire / foreign fire', 'Zār means foreign, strange, alien — that which does not belong. The fire they offered was "not commanded" (v.1b) — it lacked divine authorisation. Precisely what they did wrong is debated (wrong time? wrong coals? drunk? adding their own incense?), but the essential offence is clear: they substituted human initiative for divine command.'),
                ('ʾăšer lōʾ ṣiwwāh', 'asher lo tsiwwah', 'which he had not commanded', 'The death sentence is attached to this phrase. In Leviticus, the fatal line is this: doing what God has not commanded. The priestly system is not a canvas for creative worship but a precise divine prescription. Additions are as dangerous as subtractions.'),
                ('wayyiddōm ʾahărōn', 'wayyiddom aharon', 'and Aaron was silent', 'From dāmam, to be silent, to cease. Aaron\'s silence in the face of the death of his two sons is one of the most haunting moments in the Torah. Moses speaks; Aaron says nothing. His silence has been read as grief, as acceptance, as shock, and as the deepest possible priestly response: the service of God continues.'),
            ],
            'ctx': 'The death of Nadab and Abihu is the most shocking event in Leviticus — coming on the heels of the chapter 9 glory-fire, it is the shadow side of the divine fire. The same fire that consumed the offering in acceptance (9:24) now consumes Nadab and Abihu in judgment. Moses\'s response to Aaron (v.3) is a terse theological commentary: "Among those who approach me I will be proved holy; in the sight of all the people I will be honoured." Holiness and honour require boundary maintenance. God is not indifferent to how he is approached. Moses forbids Aaron and the remaining sons from mourning publicly (vv.6–7) — the priestly service continues even in the face of death. The following laws (vv.8–11) — no wine or strong drink before entering — may explain the offence: Nadab and Abihu may have been drunk.',
            'cross': [
                ('2 Sam 6:6–7', 'Uzzah touched the ark to steady it and died immediately. The pattern: approaching the sacred with presumptuousness, however well-intentioned, invites judgment. Divine holiness is not suspended by good motives.'),
                ('1 Cor 11:29–30', '"Whoever eats and drinks without discerning the body of Christ eats and drinks judgment on themselves. That is why many among you are weak and sick, and a number of you have fallen asleep." The NT carries forward the principle: careless approach to the holy has consequences.'),
                ('Acts 5:1–11', 'Ananias and Sapphira — sudden death for profaning the worship of the early church. The pattern of Nadab and Abihu continues in the new covenant community.'),
            ],
            'mac': [
                ('10:1–2', 'MacArthur: The fire that killed Nadab and Abihu was the same divine fire that had just ratified the sacrificial system (9:24). The people had fallen facedown in awe before it; the two priests had apparently grown casual about it. Familiarity with the sacred is not the same as intimacy with the holy — the former breeds contempt; the latter sustains reverence.'),
                ('10:3', 'MacArthur: "Aaron was silent" is one of the most theologically profound phrases in the Torah. Aaron had just lost two sons. Moses speaks the theological interpretation; Aaron accepts it without protest. His silence is not numbness but submission — the deepest priestly act of the chapter.'),
                ('10:8–11', 'MacArthur: The prohibition of wine before entering the tent, given immediately after the deaths, strongly implies intoxication as a contributing cause. The priest must enter the holy place with unimpaired judgment — able to distinguish between the holy and the common, between the clean and the unclean. Impaired worship is disqualified worship.'),
            ],
            'milgrom': [
                ('10:1', 'Milgrom: The phrase "not commanded" (lōʾ ṣiwwāh) is the key. The offence is not any specific ritual error (though Milgrom suggests the wrong coals or wrong time) but the category violation: innovation in the priestly system is forbidden. The cult is a closed system; its boundaries are the divine commands. Nadab and Abihu stepped outside those boundaries and into the holy — with fatal consequences.'),
                ('10:2', 'Milgrom: The fire that consumed them was the same fire from 9:24 — the divine fire that has taken up residence on the altar. It is not an exceptional act of judgment but the normal operation of divine holiness: the holy consumes what is incompatible with it. The sacred fire does not know intention; it knows only authorisation.'),
            ],
            'sarna': [
                ('10:3', 'Sarna: Moses\'s citation — "Among those who approach me I will be proved holy" — is either a direct quotation from an otherwise unrecorded divine utterance, or a theological summary Moses draws from the event. Either way, it is the hermeneutical key: proximity to God intensifies both blessing and danger. Those who approach most closely bear the greatest responsibility.'),
            ],
            'alter': [
                ('10:3', 'Alter: "Wayyiddōm ʾahărōn" — and Aaron was silent. Three Hebrew words. In the entire Torah there is no more pregnant silence. Every reader must supply its content. There is no gloss, no editorial comment, no divine consolation offered to Aaron. His sons are dead; the service continues; Aaron says nothing.'),
            ],
            'calvin': [
                ('10:1–3', 'Calvin: The death of Nadab and Abihu teaches that God is not a constitutional monarch who must accept whatever worship his subjects choose to offer. He is the sovereign who defines the terms of approach. The Reformers drew on this principle against the Roman addition of unscriptural ceremonies: only what God has commanded is acceptable — everything else is ʾēš zārāh, strange fire.'),
            ],
            'netbible': [
                ('10:1', 'NET Note: "Unauthorised fire" — the Hebrew ʾēš zārāh offers no further specification. Ancient interpreters and modern scholars propose: wrong coals (from outside the altar), wrong time (not the scheduled incense offering hour), wrong censer, or intoxication (suggested by vv.8–11). The ambiguity may be deliberate — the offence is the category (unauthorised), not a specific ritual error.'),
            ],
        },
        {
            'header': 'Verses 12–20 — The Priestly Portions; Moses\'s Anger; Aaron\'s Defence',
            'verses': verse_range(12, 20),
            'heb': [
                ('wayyiḥar lĕmōšeh', 'wayyichar leMoshe', 'and Moses was angry', 'The Qal of ḥārāh — to burn, to be hot with anger. Moses is furious that the sin offering was burned rather than eaten (as required by Lev 6:26). But Aaron\'s explanation wins him over — and the chapter ends not with divine judgment but with Moses\'s acceptance of a legitimate priestly decision.'),
            ],
            'ctx': 'The chapter\'s second half (vv.12–20) turns from death to the ongoing priestly service — life goes on at the altar even on the worst day. Moses instructs Eleazar and Ithamar (the surviving sons) about their portions of the grain offering and the sin offering. Then he discovers that the sin offering goat has been burned rather than eaten and confronts them angrily. Aaron responds: in the circumstances of this day — two sons dead, themselves in mourning — how could eating the sin offering be pleasing to the Lord? Moses accepts this reasoning. The passage is remarkable: a priest makes a situational judgement that diverges from the written rule, gives his reasoning, and is vindicated. Priestly authority includes contextual discernment.',
            'cross': [
                ('Matt 12:3–7', '"Haven\'t you read what David did when he and his companions were hungry? He entered the house of God and ate the consecrated bread — which was not lawful for him to eat… If you had known what these words mean, \'I desire mercy, not sacrifice,\' you would not have condemned the innocent." Jesus defends David\'s action using the same logic Aaron uses here: extraordinary circumstances can legitimately modify ritual prescription when the intent remains faithful.'),
                ('Hos 6:6', '"I desire mercy, not sacrifice." The tension between rule and context that Aaron navigates here runs through the OT prophetic tradition and into Jesus\'s own teaching.'),
            ],
            'mac': [
                ('10:16–18', 'MacArthur: Moses\'s anger — a rare display for the usually patient lawgiver — reflects his deep investment in the correct operation of the priestly system he has just spent chapters installing. The sin offering must be eaten by the priests; that is its prescribed purpose. To burn it is to waste the holy food.'),
                ('10:19–20', 'MacArthur: Aaron\'s defence is a masterpiece of pastoral theology: the rule exists to serve the covenant relationship, not to override it. On a day when two sons have been consumed by divine fire, eating the sin offering before the Lord would have been a grotesque performance, not a faithful act. Moses recognises the wisdom and is satisfied. The law has a spirit as well as a letter.'),
            ],
            'milgrom': [
                ('10:19', 'Milgrom: Aaron\'s response is the earliest recorded instance of rabbinic-style legal reasoning: applying the principle behind a law to a case the law does not explicitly address. The sin offering\'s purpose is to make atonement; eating it in mourning clothes on the day of your sons\' deaths would not achieve that purpose. Aaron grasps the law\'s telos and acts accordingly. Moses cannot fault the reasoning.'),
                ('10:20', 'Milgrom: "When Moses heard this, he was satisfied" — the Hebrew wayyîṭab bĕʿênāyw, literally "it was good in his eyes." This is a significant concession: the ordained law has a measure of flexibility when the priest responsible for implementing it makes a reasoned case. The priestly system is not mechanical.'),
            ],
            'sarna': [
                ('10:16–20', 'Sarna: The episode is a coda on the nature of priestly authority. Aaron, fresh from the worst day of his life, does not grovel before Moses but gives a clear-eyed theological argument for his decision. Moses, the lawgiver, accepts it. The scene establishes that priestly wisdom — contextual, pastoral, responsive to the moment — is a legitimate form of Torah interpretation.'),
            ],
            'alter': [
                ('10:19', 'Alter: Aaron speaks for the first and only time in chapter 10 — not about his sons\' deaths, but about the sin offering. His two-clause argument is quiet and devastating: these things happened to me today; if I had eaten the sin offering today, would it have been good in the Lord\'s eyes? He has already absorbed the blow of his sons\' deaths; now he defends the integrity of his remaining service. It is a portrait of a priest continuing to function under unbearable conditions.'),
            ],
            'calvin': [
                ('10:19–20', 'Calvin: Aaron\'s answer reveals that even the most exact ceremonies must yield to the spirit of the law when circumstances demand. God is not served by rigid external performance that ignores the interior condition of the worshipper. The priests mourning their brothers could not have eaten the sacrifice with the joy and gratitude that its proper reception required. Moses recognises this — and so must we in our own worship.'),
            ],
            'netbible': [
                ('10:19', 'NET Note: Aaron\'s defence turns on the word "today" (hayyôm). The sin offering is to be eaten "on the day it is offered" (6:26) — and today is the day his sons were killed by divine fire. On that specific day, he argues, eating it would have been ritually and theologically impossible. The contextual qualifier "today" appears twice in his two-clause argument.'),
            ],
        },
    ],
})

print("LEV-2 complete: Leviticus 8–10 built.")

# ─────────────────────────────────────────────────────────────────────────────
# LEV-3: Chapters 11–15 — The Purity System
# ─────────────────────────────────────────────────────────────────────────────

lev(11, {
    'title': 'Clean and Unclean Animals: The Theology of Distinction',
    'sections': [
        {
            'header': 'Verses 1–23 — Land Animals, Sea Creatures, and Birds',
            'verses': verse_range(1, 23),
            'heb': [
                ('ṭāhôr / ṭāmēʾ', 'tahor / tame', 'clean / unclean', 'The fundamental binary of Levitical purity. These are ritual-status categories, not moral ones — an unclean animal is not sinful; it simply cannot be eaten or its carcass touched without incurring ritual impurity. The clean/unclean distinction structures Israel\'s interface with the created world.'),
                ('šereṣ', 'sherets', 'swarming things / teeming creatures', 'The lowest category of creatures — those that swarm on the earth (land and water). They generate the highest level of impurity: contact defiles immediately. The category maps roughly to creatures associated with death and decay.'),
            ],
            'ctx': 'The food laws of Lev 11 are not primarily about hygiene (though some unclean animals do carry pathogens) but about boundary maintenance — both theological (Israel distinct from the nations) and ontological (the clean world ordered, complete, whole). Milgrom\'s influential analysis: clean animals are those fully adapted to their habitat (land animals with cloven hooves that chew the cud; sea creatures with fins AND scales; birds that are not birds of prey). Animals that cross boundaries or occupy ambiguous niches (pigs: hooves but no cud; shellfish: water but no fins-and-scales) are unclean. The dietary laws enact the creation order at every meal.',
            'cross': [
                ('Acts 10:9–16', 'Peter\'s vision — the sheet lowered from heaven, the voice: "Do not call anything impure that God has made clean." The food laws are declared fulfilled in Christ; the barrier between clean and unclean Jew and Gentile is dismantled.'),
                ('Mark 7:18–19', '"Don\'t you see that nothing that enters a person from the outside can defile them?… In saying this, Jesus declared all foods clean." The food laws served their pedagogical purpose; their dissolution signals the arrival of the new covenant.'),
                ('Col 2:16–17', '"Do not let anyone judge you by what you eat or drink… These are a shadow of the things that were to come; the reality, however, is found in Christ."'),
            ],
            'mac': [
                ('11:1–8', 'MacArthur: The two-part requirement for clean land animals — split hooves AND chews the cud — means no one characteristic is sufficient. The pig (split hoof, no cud) and the camel (chews cud, no split hoof) are equally disqualified. The laws resist simple analogical reading; they demand binary compliance.'),
                ('11:20–23', 'MacArthur: The prohibition on most winged insects is broken by the exception for locusts, katydids, crickets, and grasshoppers — the very insects John the Baptist ate (Matt 3:4). The exception is not arbitrary; these insects walk on their legs (not "crawl on all fours") and have jointed rear legs for leaping. They belong fully to their element; they do not cross categories.'),
            ],
            'milgrom': [
                ('11:1–23', 'Milgrom: The dietary laws encode a theology of creation order. Clean animals are those fully adapted to their ecological niche — defined by their primary mode of locomotion and environment. Animals that "cheat" their habitat categories (amphibious creatures, bottom-feeders, carrion birds) are unclean. Eating only clean animals means aligning the diet with creation\'s structure.'),
                ('11:44–45', 'Milgrom: The dietary laws\' theological rationale is stated explicitly: "Be holy because I, the Lord your God, am holy." The clean/unclean distinction is not merely practical but participatory — Israel\'s diet enacts the divine distinction between holy and common.'),
            ],
            'sarna': [
                ('11:1–23', 'Sarna: The food laws are one of Israel\'s most distinctive cultural markers. They function sociologically to prevent assimilation — a people who cannot share a meal with their neighbours will maintain their identity. The laws create a community of practice sustained by daily embodied behaviour.'),
            ],
            'alter': [
                ('11:3–8', 'Alter: The chiastic structure of the animal taxonomy — split hoof AND cud (clean), split hoof NOT cud / cud NOT split hoof (unclean), neither (unclean) — reflects the priestly writers\' taxonomic method. Classification is the mode of holiness; the ordered table of creatures reflects the ordered creation of Gen 1.'),
            ],
            'calvin': [
                ('11:44–45', 'Calvin: The food laws teach that God\'s holiness must permeate every area of life — including the table. What we eat is a theological statement. The Christian is not bound by these specific laws, but the principle remains: our bodies, our appetites, and our daily practices are to be shaped by the holiness of God who indwells us.'),
            ],
            'netbible': [
                ('11:3', 'NET Note: "Chews the cud" (maʿăleh gērāh) — ruminants. "Completely divided hoof" (parsāh pĕrusāh) — ungulates with cleft hooves. Both conditions must be met. The double requirement prevents extending the category to ambiguous cases — a safeguard against the boundaries being blurred.'),
            ],
        },
        {
            'header': 'Verses 24–47 — Carcass Defilement; Summary: Holy to the Lord',
            'verses': verse_range(24, 47),
            'heb': [
                ('nĕbēlāh', 'nevelah', 'carcass / dead body of an animal', 'An animal that died naturally or was killed by another animal — not slaughtered by the prescribed method. Contact with a carcass generates impurity until evening even for clean animals. Death itself carries a kind of impurity in Leviticus.'),
                ('wĕhithqaddištěm', 'wehithqadishshem', 'consecrate yourselves / make yourselves holy', 'Hithpael reflexive of qādaš — to make oneself holy. The food laws are not merely prohibitions but positive acts of self-consecration. Every compliant meal is a minor liturgical act.'),
            ],
            'ctx': 'The chapter\'s second half (vv.24–47) addresses carcass-defilement — touching the carcass of any unclean animal, or even of clean animals that died naturally, generates impurity until evening and requires washing. Vessels that are touched must be cleaned or broken (earthenware). The principle: death is the domain of impurity; holiness is the domain of life. The chapter closes with the explicit theological rationale (vv.44–45): "Be holy, because I am holy." The dietary laws are not arbitrary — they are participatory in God\'s own holiness.',
            'cross': [
                ('Heb 9:14', '"How much more, then, will the blood of Christ, who through the eternal Spirit offered himself unblemished to God, cleanse our consciences from acts that lead to death." The NT\'s language of purification from "dead works" draws directly on Levitical categories.'),
                ('1 Pet 1:15–16', '"Just as he who called you is holy, so be holy in all you do; for it is written: \'Be holy, because I am holy.\'" Peter quotes Lev 11:44–45 as a living NT imperative. The theological core of the dietary laws survives their abrogation.'),
            ],
            'mac': [
                ('11:44–47', 'MacArthur: The summary of chapter 11 states the purpose of the entire purity system: "to distinguish between the unclean and the clean, between living creatures that may be eaten and those that may not be eaten." The dietary laws are a daily, embodied practice of distinction-making — teaching Israel that God is different, that Israel is called to be different, and that the created order reflects the divine holiness.'),
            ],
            'milgrom': [
                ('11:24–40', 'Milgrom: The carcass-defilement laws reveal an important principle: death generates impurity even in clean animals. The distinction is not clean vs. unclean animal as such, but life-force vs. death-force. Clean animals can be eaten when slaughtered; their carcasses (death-state) still defile. This supports Milgrom\'s thesis that the purity system fundamentally maps the life-death polarity onto the clean-unclean binary.'),
            ],
            'sarna': [
                ('11:44–45', 'Sarna: The explicit theological rationale — "I am the Lord your God; consecrate yourselves and be holy, because I am holy" — is unique among the food law passages. Elsewhere the laws are given without rationale; here the reason is stated: Israel\'s dietary practice is an extension of the divine holiness that defines their covenant identity.'),
            ],
            'alter': [
                ('11:44', 'Alter: "For I am the Lord your God, consecrate yourselves and be holy for I am holy" — the divine self-identification and the imperative it grounds. The food laws are not culture but ontology: what Israel eats participates in who God is. The meal table is a theological instrument.'),
            ],
            'calvin': [
                ('11:24–40', 'Calvin: The defilement from carcass contact teaches the believer to maintain separation from spiritual death — the corruption of the world, the deadness of false religion, the decay of sin. Though the specific laws are fulfilled, the principle of avoiding contamination by what is spiritually "dead" applies to the Christian life.'),
            ],
            'netbible': [
                ('11:45', 'NET Note: "I brought you up out of Egypt to be your God" — the Exodus is cited as the ground of the holiness imperative. Redemption creates obligation. Because YHWH acted to deliver Israel, Israel owes him holy living. The food laws are not a burden but a response to grace.'),
            ],
        },
    ],
})

lev(12, {
    'title': 'Purification After Childbirth',
    'sections': [
        {
            'header': 'Verses 1–5 — The Purification Periods: Son and Daughter',
            'verses': verse_range(1, 5),
            'heb': [
                ('niddāh', 'niddah', 'menstrual impurity / separation', 'The same term used for menstrual impurity (Lev 15:19–24) and applied here to the bleeding after childbirth. The impurity is not moral — childbirth is blessed by God — but ritual: the blood-flow creates a state that temporarily restricts access to the sanctuary.'),
                ('yāmîm', 'yamim', 'days', 'The purification periods — 33 days for a boy (total 40), 66 days for a girl (total 80) — are liturgical durations, not medical prescriptions. The doubled period for a girl has been much discussed; no fully satisfying explanation has emerged.'),
            ],
            'ctx': 'Leviticus 12 is brief (8 verses) but theologically dense. Childbirth is not sin — the mother is not guilty of anything. Yet the blood flow associated with birth creates a state of ritual impurity similar to menstrual impurity (niddāh). The purification period has two phases: the first (7 days for boy/14 for girl) she is like during menstruation — full impurity; the second (33/66 days) she is "continuing in the blood of her purification" — lesser impurity. At the end she brings a burnt offering and a sin offering. The sin offering (ḥaṭṭāʾt) here is not for a sin committed but for the transition from an impure state back to the holy — the same logic as the purification offering throughout Leviticus.',
            'cross': [
                ('Luke 2:22–24', '"When the time came for the purification rites required by the Law of Moses, Joseph and Mary took him to Jerusalem." Mary brought the bird offering (v.8) — the poor person\'s provision. The Son of God entered the world under the full weight of the Levitical purity system, born of a woman under the law.'),
                ('Gal 4:4–5', '"God sent his Son, born of a woman, born under the law, to redeem those under the law." The incarnation is defined by entry under Levitical obligation.'),
                ('Ps 51:5', '"Surely I was sinful at birth, sinful from the time my mother conceived me." The childbirth-impurity law gave David the vocabulary for his meditation on original sinfulness — not that birth causes sin, but that the impurity system maps onto the human condition of needing purification.'),
            ],
            'mac': [
                ('12:1–5', 'MacArthur: The mother\'s ritual impurity after childbirth is not a condemnation of childbirth or of the female body — God commanded childbearing (Gen 1:28) and blessed it throughout Scripture. The impurity arises from the blood-flow, not from the act of birth itself. The law is pastorally designed: it gives the new mother a period of seclusion and recovery before she resumes full cultic participation.'),
                ('12:6–8', 'MacArthur: The provision of birds for mothers who cannot afford a lamb (v.8) is one of Leviticus\'s recurring pastoral accommodations. Mary\'s offering of turtledoves at Jesus\'s presentation (Luke 2:24) is a window into the holy family\'s economic circumstances — and a reminder that the law of God is attentive to the poor.'),
            ],
            'milgrom': [
                ('12:1–5', 'Milgrom: The doubled purification period for a girl (80 days vs 40 for a boy) has generated extensive debate. Milgrom\'s suggestion: the female child herself will eventually be subject to the niddāh impurity, so her arrival brings a doubled impurity potential. Other scholars simply acknowledge the text\'s silence on the rationale.'),
                ('12:6–8', 'Milgrom: The ḥaṭṭāʾt at the end of the purification period is a "purification offering" (Milgrom\'s preferred translation) — it purges the sanctuary of whatever residual impurity the mother\'s condition may have generated, even at a distance. The offering is not for sin; it marks the transition from impure state to clean.'),
            ],
            'sarna': [
                ('12:3', 'Sarna: The eighth-day circumcision mandate, embedded in the childbirth laws, connects the birth of a boy to the covenant of Abraham (Gen 17:12). The purity system and the covenant identity system are linked: the boy enters the covenant on the same day the impurity period\'s most intense phase ends.'),
            ],
            'alter': [
                ('12:1–5', 'Alter: The brevity of this chapter — eight verses for a topic that touches birth, blood, gender, and purification — is striking. The priestly writers do not linger; they legislate. The law is a frame around the experience of birth, not a meditation on it. What the frame accomplishes — temporary seclusion, formal re-entry, the guarantee that every birth is accompanied by priestly ritual — is the point.'),
            ],
            'calvin': [
                ('12:6–8', 'Calvin: The requirement that even a mother who has done nothing wrong must bring a sin offering teaches that we are in a state of impurity not only from our actions but from our condition. The need for purification is universal. Only in Christ do we find a purification that addresses not just acts but the state of our nature.'),
            ],
            'netbible': [
                ('12:8', 'NET Note: The bird provision (two turtledoves or two young pigeons) is the same graduated poverty provision as in Lev 5:7–10. Its appearance here confirms that the entire purity system is designed with economic accessibility in mind — no Israelite woman, however poor, is excluded from formal re-entry into the covenant community after childbirth.'),
            ],
        },
        {
            'header': 'Verses 6–8 — The Purification Offerings: Lamb or Birds',
            'verses': verse_range(6, 8),
            'heb': [
                ('olah / chatat', 'olah / chatat', 'burnt offering / sin offering', 'The two-offering combination marking re-entry. The burnt offering expresses total consecration; the sin offering purges residual impurity. Together they formally restore the mother to full covenant worship.'),
            ],
            'ctx': "The purification offerings mark the transition from impure state back to full covenant life. The prescribed offering is a year-old lamb plus a bird. The poverty provision — two turtledoves or two pigeons — is the offering Mary brought at Jesus's presentation (Luke 2:24), revealing the holy family's economic situation. The priest declares the mother clean — not because she sinned in giving birth, but because the blood-flow impurity is formally resolved and she is re-integrated into the covenant community.",
            'cross': [
                ('Luke 2:22–24', "Joseph and Mary brought the poverty provision of v.8 — a pair of turtledoves. The Son of God entered under the full weight of the Levitical system, born of a woman under the law."),
                ('Heb 9:12–14', "He entered the Most Holy Place once for all by his own blood — the fulfillment of every ḥaṭṭāʾt offering."),
            ],
            'mac': [
                ('12:6–8', "MacArthur: The bird provision is the poorest-tier option throughout Leviticus. Mary's use of it at Jesus's presentation (Luke 2:24) locates the incarnation among the economically marginal. The one who would declare all foods clean and all people welcome entered the world under the laws that most restricted the poor."),
                ('12:6–7', "MacArthur: The mother's purification offerings complete the liturgical cycle that began with birth. The burnt offering signifies her complete re-dedication to God; the sin offering restores her full access to the sanctuary. Dedication and purification together characterise the entire Levitical worship system."),
            ],
            'milgrom': [
                ('12:6–7', "Milgrom: The ḥaṭṭāʾt here is not for sin but for transition from impurity to purity. Milgrom's consistent interpretation: it purges the sanctuary of whatever impurity the mother's state generated at a distance. The offering marks formal re-entry, not expiation of guilt."),
            ],
            'sarna': [
                ('12:6–8', "Sarna: The graduated offering provision is consistent with the Torah's pastoral concern throughout Leviticus. No Israelite woman, however poor, is denied the formal re-entry ceremony after childbirth."),
            ],
            'alter': [
                ('12:8', "Alter: The final verse of chapter 12 — a single, economically calibrated provision — settles the entire matter of a woman's post-partum re-entry into the covenant community. The legislative compression is characteristic of the priestly style."),
            ],
            'calvin': [
                ('12:6–8', "Calvin: The sin offering at the end of the purification period teaches the universal need for mediation between fallen humanity and holy God. Every return to full covenant standing requires atonement — Christ is that covering, once for all."),
            ],
            'netbible': [
                ('12:8', "NET Note: 'If she cannot afford a lamb' — the poverty provision appears in Lev 5:7 and 14:21–22 also. It is a recurring structural element of the purity legislation, ensuring full access to purification for the poorest members of the covenant community."),
            ],
        }
    ],
})
lev(13, {
    'title': 'Skin Diseases and Mould: The Priest as Diagnostician',
    'sections': [
        {
            'header': 'Verses 1–46 — The Examination and Diagnosis of Skin Conditions',
            'verses': verse_range(1, 46),
            'heb': [
                ('ṣāraʿat', 'tsara\'at', 'skin disease / scale disease / traditionally "leprosy"', 'The English "leprosy" (Hansen\'s disease) is almost certainly a mistranslation. Ṣāraʿat covers a wide range of scale-like, spreading skin conditions — psoriasis, vitiligo, impetigo, eczema, fungal infections. The priest\'s role is diagnostic-ritual, not medical; he declares status, not disease.'),
                ('ṭāmēʾ / ṭāhôr', 'tame / tahor', 'unclean / clean', 'The priest\'s verdict is a binary ritual declaration, not a medical diagnosis. The same physical condition may be declared clean or unclean depending on its appearance, spread, and associated signs. The criteria are liturgical, not pathological.'),
            ],
            'ctx': 'Leviticus 13 is the longest chapter in the book (59 verses) — a detailed diagnostic manual for the priest examining skin conditions. The logic throughout is consistent: a condition that has completely turned white and is not spreading may be clean (completeness even in the extreme = the skin has reached a stable state); a raw patch, spreading discolouration, or white hair in the mark = unclean. The person must present themselves twice (after seven days, sometimes a second seven days) before a final verdict is given. If declared unclean, the person tears their clothes, leaves hair dishevelled, covers their upper lip, and calls out "Unclean! Unclean!" — they are quarantined outside the camp.',
            'cross': [
                ('Luke 17:11–19', '"Ten men who had leprosy met him. They called out in a loud voice, \'Jesus, Master, have pity on us!\' When he saw them, he said, \'Go, show yourselves to the priests.\'" Jesus follows the Levitical procedure — the priest\'s declaration of clean is required for re-entry into community. He fulfils, not abolishes, the system.'),
                ('Num 12:9–15', 'Miriam struck with ṣāraʿat for speaking against Moses — quarantined outside the camp for seven days, then readmitted. The entire nation waited for her (v.15). The social dimension of the purity law: the community halts for one member\'s restoration.'),
                ('Isa 53:4', '"Surely he took up our pain and bore our suffering, yet we considered him punished by God, stricken by him, and afflicted." The Servant\'s suffering is described using ṣāraʿat language — "stricken" (nāgûaʿ) is the word for the ṣāraʿat-sufferer. Christ bears the ultimate exile.'),
            ],
            'mac': [
                ('13:1–8', 'MacArthur: The priest\'s role in skin disease assessment is entirely ritual, not medical. He does not treat; he declares. The seven-day quarantine (v.4) is precautionary — allowing time for the condition to declare itself before a verdict is rendered. The system is designed for accuracy: premature declaration could exclude a healthy person; delay could allow a spreading condition to defile the camp.'),
                ('13:45–46', 'MacArthur: The exclusion from the camp is not primarily punitive but protective — both of the community and of the sacred space. The ṣāraʿat-sufferer\'s distinctive appearance (torn clothes, dishevelled hair, covered lip) and warning cry ("Unclean! Unclean!") serve as a system of public health communication. The person is not condemned; they are quarantined.'),
            ],
            'milgrom': [
                ('13:2–8', 'Milgrom: The diagnostic criteria in Lev 13 are liturgical, not dermatological. The priest is not a physician; he is a boundary official. His task is to determine whether a person\'s skin condition requires exclusion from the sacred community. The criteria are designed to catch spreading, active conditions — signs of life invading the skin from outside — while permitting stable, bounded conditions.'),
                ('13:45–46', 'Milgrom: The ṣāraʿat-sufferer\'s required appearance (torn garment, loosened hair, covered lip) mirrors the mourning rituals of the bereaved. Milgrom\'s observation: the ṣāraʿat-sufferer is treated as one who is socially dead — excluded from the living community. This confirms the link between impurity and death that runs through Lev 11–15.'),
            ],
            'sarna': [
                ('13:1–3', 'Sarna: The opening of Lev 13 positions it as divine instruction rather than folk custom — "the Lord said to Moses and Aaron." The purity laws are not Israelite cultural development but covenantal legislation. Their authority derives from Sinai, not from ANE medical practice, however parallel some of the symptomology may be.'),
            ],
            'alter': [
                ('13:3', 'Alter: The priest\'s examination is described with clinical detachment: "he shall examine the sore on the skin." The vocabulary of looking, examining, and declaring creates a ritual gaze — the priest\'s eyes become the instrument of communal boundary maintenance. Seeing is a priestly act.'),
            ],
            'calvin': [
                ('13:45–46', 'Calvin: The ṣāraʿat laws teach that sin, like a skin disease, must be examined, declared, and addressed before restoration can occur. The church has a duty of church discipline analogous to the priest\'s function: naming what is wrong, temporarily excluding what is dangerous, and providing a path to restoration. The goal is always readmission (Lev 14), not permanent exclusion.'),
            ],
            'netbible': [
                ('13:3', 'NET Note: "White hair in the sore" is the key sign of active ṣāraʿat — depigmented hair in a depigmented patch signals that the condition has affected the deeper layers of skin. This is more consistent with psoriasis or vitiligo than with Hansen\'s disease (leprosy), which typically does not cause white hair.'),
            ],
        },
        {
            'header': 'Verses 47–59 — Mould in Fabric and Leather',
            'verses': verse_range(47, 59),
            'heb': [
                ('negaʿ ṣāraʿat', 'nega tsara\'at', 'mark/disease of ṣāraʿat', 'The same term applied to skin disease is used for spreading mould/mildew on fabric (vv.47–59) and on buildings (Lev 14:33–57). Ṣāraʿat is not a single disease but a category: spreading, boundary-violating contamination in skin, fabric, or stone.'),
            ],
            'ctx': 'The chapter extends the ṣāraʿat category from human skin to fabric and leather — woolly garments, linen items, and leather goods. The diagnostic process mirrors the skin disease procedure: quarantine for seven days (v.50), re-examine, wash if the spread has stopped, re-quarantine a second seven days if ambiguous, burn if it spreads. The application of ṣāraʿat to inanimate objects confirms that it is a ritual category (boundary-violating contamination) rather than a medical one.',
            'cross': [
                ('Rev 3:4', '"You have a few people in Sardis who have not soiled their garments; they will walk with me, dressed in white, for they are worthy." The language of pure/soiled garments extends the Levitical fabric-purity metaphor into the NT eschatological register.'),
                ('Jude 23', '"Save others by snatching them from the fire; to others show mercy, mixed with fear — hating even the clothing stained by corrupted flesh." Jude borrows the ṣāraʿat-in-fabric logic to describe moral contamination.'),
            ],
            'mac': [
                ('13:47–59', 'MacArthur: The extension of ṣāraʿat to fabric is not a concession to primitive superstition but a theological consistency: the same principles of boundary and spread that govern skin disease govern everything in the Israelite world. Contamination is not confined to bodies; it pervades the material environment. The priest must manage the entire cosmos of the camp.'),
            ],
            'milgrom': [
                ('13:47–59', 'Milgrom: The fabric-ṣāraʿat passages demonstrate that ṣāraʿat is a ritual-taxonomic category, not a medical one. No modern fungal, mould, or mildew condition exactly matches the described symptoms. The category captures the idea of spreading contamination — things that violate boundaries, proliferate, and threaten to spread to the human community.'),
            ],
            'sarna': [
                ('13:51', 'Sarna: "A malignant ṣāraʿat" (ṣāraʿat mamaʿeret, a spreading disease) — the diagnostic criterion for condemning fabric is the same as for skin: active spread. The system is consistent across its domains. What is stable and bounded may be clean; what is spreading and boundary-violating must be addressed.'),
            ],
            'alter': [
                ('13:47–59', 'Alter: The fabric legislation is the priestly system at its most consistent and its most alien to modern sensibility. The same diagnostic gaze — examination, quarantine, re-examination — applied to a rash on human skin is now applied to a stain on a garment. The created world is one continuous field of holiness and impurity; the priest must manage all of it.'),
            ],
            'calvin': [
                ('13:47–59', 'Calvin: The extension of the purity laws to garments teaches that no material thing is beyond the reach of holiness or contamination. The Christian is called not only to personal holiness but to maintain a holy environment — "hating even the garment stained by the flesh" (Jude 23). The whole material life is a spiritual concern.'),
            ],
            'netbible': [
                ('13:51', 'NET Note: "Spreading ṣāraʿat" in fabric is likely a mould or mildew condition — perhaps Aspergillus or similar fungi that spread through organic material. The green and reddish coloration (v.49) matches some mould species. The category is taxonomically consistent with skin disease: spreading, boundary-violating contamination.'),
            ],
        },
    ],
})

lev(14, {
    'title': 'The Purification of Skin Disease: Restored to the Community',
    'sections': [
        {
            'header': 'Verses 1–32 — The Two-Stage Purification Ritual',
            'verses': verse_range(1, 32),
            'heb': [
                ('ṭāhēr', 'taher', 'to declare clean / to purify', 'The priest\'s declaration of clean after inspection — a ritual verdict that restores the person to community. The same word used for the initial clean declaration; here it follows purification rather than initial assessment.'),
                ('ʿēṣ ʾerez', 'ets erez', 'cedar wood', 'Part of the purification bundle (cedar, scarlet yarn, hyssop) used to sprinkle the healed person. Cedar is fragrant, resistant to decay — associated with life and vitality. Its use signals restoration to the realm of the living.'),
            ],
            'ctx': 'The purification of a healed ṣāraʿat-sufferer is the most elaborate ritual in Leviticus outside the Day of Atonement. Two stages: the first ceremony (vv.4–9) is performed outside the camp — two birds, cedar, scarlet yarn, hyssop. One bird is killed over fresh water; the live bird is dipped in the blood-water mixture and released (like the scapegoat in Lev 16). The person is sprinkled seven times, declared clean, washes clothes and hair, and waits seven days outside before full re-entry. The second stage (vv.10–32) — on the eighth day — mirrors the priestly ordination of Lev 8: blood on the right earlobe, thumb, and big toe; oil over the blood; sin offering, guilt offering, burnt offering. The healed person is, in effect, re-ordained into full covenant life.',
            'cross': [
                ('Luke 5:12–14', '"Jesus reached out his hand and touched the man. \'I am willing,\' he said. \'Be clean!\' And immediately the leprosy left him. Then Jesus ordered him… \'go, show yourself to the priest and offer the sacrifices that Moses commanded.\'" Jesus pronounces clean and then sends to the priest for the Levitical purification process.'),
                ('Heb 9:19', '"When Moses had proclaimed every command of the law to all the people, he took the blood of calves… together with scarlet wool and branches of hyssop, and sprinkled the scroll and all the people." The hyssop and scarlet of Lev 14 appear throughout the purification rituals of Hebrews as types of Christ\'s blood.'),
            ],
            'mac': [
                ('14:4–9', 'MacArthur: The two-bird ritual enacts the logic of substitution and release: one bird dies, its blood mingled with water; the live bird carries the blood into the open fields, symbolically bearing away the impurity. The same drama as the two goats of Yom Kippur (Lev 16): death and expulsion together accomplish the purification.'),
                ('14:10–20', 'MacArthur: The earlobe, thumb, and toe anointing (v.14) is the identical procedure as Aaron\'s ordination (8:23). The healed person is not merely returned to their former status — they are, in effect, re-consecrated, re-inducted into the covenant community. Restoration is more than recovery; it is re-creation.'),
            ],
            'milgrom': [
                ('14:4–7', 'Milgrom: The two-bird ritual reverses the status of the ṣāraʿat-sufferer who was effectively treated as dead (outside the camp, mourning gestures). The dead bird in the bowl of water = death has been enacted; the released bird carrying the blood = the death has been expelled, reversed. The person is re-entered into the category of the living.'),
                ('14:14', 'Milgrom: The earlobe-thumb-toe blood application for the healed person is one of Milgrom\'s key pieces of evidence that Lev 8 and Lev 14 share a common ritual logic: the re-consecration of the whole person for covenant service. Healing and ordination share the same liturgical grammar.'),
            ],
            'sarna': [
                ('14:10–18', 'Sarna: The graduated offering provision (lamb and oil for the standard case; birds and oil for the poor, vv.21–32) demonstrates that the purification system is accessible regardless of economic status. The poor receive a fully valid purification — the theological content is identical; only the animal substituted differs.'),
            ],
            'alter': [
                ('14:4–7', 'Alter: The two-bird ritual is among the most visually striking in the Torah: one bird killed over a clay pot with fresh water, blood mixed with water, live bird dipped in the mixture and released to fly away over open country. The released bird, blood-stained but alive, is a remarkable image — impurity transported beyond the camp\'s boundaries into the free expanse of the world outside.'),
            ],
            'calvin': [
                ('14:1–20', 'Calvin: The elaborate purification of the healed person teaches that restoration to God\'s community requires more than physical recovery — it requires formal, priestly re-entry. The church has a corresponding responsibility: not merely to welcome the repentant but to formally receive them, to mark their re-entry with the rituals of the community, to ensure they are genuinely restored rather than simply tolerated.'),
            ],
            'netbible': [
                ('14:4', 'NET Note: "Two live clean birds" — the use of two birds parallels the two-goat ritual of Yom Kippur (Lev 16:7–10). In both cases, one dies (bearing impurity/sin) and one is released (expelling what was borne). The ritual logic is consistent: purgation of the impurity requires both its death and its expulsion from the camp.'),
            ],
        },
        {
            'header': 'Verses 33–57 — Mould in Houses; Summary of Purification Laws',
            'verses': verse_range(33, 57),
            'heb': [
                ('negaʿ babbāyit', 'nega babayit', 'mark/disease in the house', 'The ṣāraʿat category extended to stone buildings. A spreading mould/fungal growth in a house may require quarantine, removal of affected stones, replastering — or demolition if it persists. The same ritual logic as skin disease and fabric contamination.'),
            ],
            'ctx': 'The house-ṣāraʿat section (vv.33–53) mirrors the fabric-ṣāraʿat of Lev 13: quarantine, inspection, removal of affected stones, replastering. If it persists, demolition. The purification of a healed house (vv.48–53) mirrors the purification of a healed person (Lev 14:4–7) — the same two-bird ritual. The chapter closes (vv.54–57) with a summary of all the ṣāraʿat laws (skin disease, fabric, house), framing the entire Lev 13–14 unit as a unified legislation for "the law for any infectious skin disease."',
            'cross': [
                ('1 Cor 5:6–7', '"Don\'t you know that a little yeast leavens the whole batch of dough? Get rid of the old yeast." Paul uses the spreading-contamination logic of ṣāraʿat directly — the church community is like the house that must be cleared of spreading corruption.'),
                ('Rev 21:27', '"Nothing impure will ever enter it, nor will anyone who does what is shameful or deceitful." The new Jerusalem is the ultimate clean house — no ṣāraʿat, no contamination, no need for a diagnostic priest.'),
            ],
            'mac': [
                ('14:33–42', 'MacArthur: The house-ṣāraʿat regulations anticipate Israel\'s entry into Canaan — the chapter opens, "When you enter the land of Canaan that I am giving you as your possession" (v.34). God is preparing Israel to manage not just their bodies and garments but their permanent dwellings as holy spaces. The covenant encompasses the home.'),
            ],
            'milgrom': [
                ('14:34', 'Milgrom: "I will put a spreading mould in a house" — God is described as the agent of the house ṣāraʿat. This is not demonic attack but divine testing or discipline. The house is part of the covenant domain; its contamination, like skin disease, requires priestly attention and, ultimately, either purification or removal.'),
            ],
            'sarna': [
                ('14:54–57', 'Sarna: The summary formula — "these are the regulations for any infectious skin disease, for a mildew in a garment or in a house, and for a swelling, a rash or a bright spot, to determine when something is clean or unclean" — is an editorial marker concluding the Lev 13–14 unit. The priestly writers are systematic: they conclude each legislative block with a summary that names its scope.'),
            ],
            'alter': [
                ('14:33–53', 'Alter: The house-ṣāraʿat section is the purest expression of the priestly-taxonomic project: the same diagnostic gaze, the same quarantine procedure, the same purification ritual — now applied to stone and plaster. The priestly system aspires to complete coverage of the material world: body, cloth, house.'),
            ],
            'calvin': [
                ('14:33–53', 'Calvin: The house-ṣāraʿat laws teach that no sphere of human life is exempt from the concern for holiness. The home, no less than the body, is subject to divine scrutiny. The Christian is called to maintain holy homes — not merely in ritual purity but in the absence of corruption, falsehood, and moral contamination.'),
            ],
            'netbible': [
                ('14:34', 'NET Note: "I will put a spreading mould in a house" — the divine first-person is striking and unusual. It suggests that house ṣāraʿat is not merely natural mould but a divinely permitted condition requiring priestly attention. The theological frame: Israel\'s material world is under covenant governance, not merely natural law.'),
            ],
        },
    ],
})

lev(15, {
    'title': 'Bodily Discharges: The Purity of the Body\'s Boundaries',
    'sections': [
        {
            'header': 'Verses 1–18 — Male Discharges',
            'verses': verse_range(1, 18),
            'heb': [
                ('zûb', 'zuv', 'discharge / flow', 'The root means to flow or ooze. It applies to both chronic discharges (vv.2–15: a persistent discharge from the male genitalia) and normal emissions (v.16: seminal emission). The bodily discharge creates impurity not only in the person but in everything they touch — bed, chair, saddle, clothing.'),
                ('yĕqabbēs bigdāyw', 'yeqabbes bigdav', 'he shall wash his clothes', 'The standard purification formula for minor impurity throughout Lev 11–15: washing clothes + bathing in water + waiting until evening. No sacrifice required for most contact impurities; water and time suffice.'),
            ],
            'ctx': 'Leviticus 15 addresses bodily discharges — the final section of the Lev 11–15 purity block. Chronic male discharge (vv.2–15) and chronic female discharge (vv.25–30) are the most severe: extensive contamination rules, seven-day counting after cessation, bird offering. Normal seminal emission (vv.16–18) and menstrual impurity (vv.19–24) are less severe: the person and their partner are impure until evening. The underlying principle across all four cases: bodily fluids associated with the generative function create impurity — not because reproduction is sinful but because the life-force in its most raw state (semen, menstrual blood) is holy and must be handled with ritual care.',
            'cross': [
                ('Mark 5:25–34', 'The woman with the chronic blood discharge — twelve years (cf. Lev 15:25–30 for chronic female discharge). She was continuously unclean, excluded from full worship, unable to touch anyone without making them unclean. She touches Jesus\'s cloak; instead of his becoming unclean, she becomes clean. The reversal is complete.'),
                ('Ezek 36:25', '"I will sprinkle clean water on you, and you will be clean; I will cleanse you from all your impurities." Ezekiel\'s new covenant promise uses the Lev 15 purification language — complete cleansing from all zûb-impurity.'),
            ],
            'mac': [
                ('15:2–12', 'MacArthur: The chronic discharge (likely gonorrhoea or another genital infection) creates extensive contamination: everything the person sits on, lies on, or touches becomes impure — and those who touch those objects are also impure until evening. The quarantine logic is similar to skin disease: the condition spreads its impurity to the entire environment.'),
                ('15:16–18', 'MacArthur: The normal seminal emission creates impurity until evening — not because sexuality is sinful but because the seed of life carries a holiness that requires ritual management. The couple who have sexual relations together are both impure until evening — a gentle boundary around marital intimacy that keeps it within a framework of holiness.'),
            ],
            'milgrom': [
                ('15:2–15', 'Milgrom: The chronic discharge impurity is the most extensive in Lev 15 because it is the most threatening to the community\'s holy status. Milgrom\'s analysis: all discharge impurities relate to the body\'s boundary — fluids that emerge from the body cross the inner/outer boundary, generating impurity. The more chronic and uncontrolled the discharge, the greater the impurity.'),
                ('15:16–18', 'Milgrom: The seminal emission impurity (until evening) is the mildest in the entire purity system. Its brevity signals that normal sexuality is not problematic — only temporarily impurity-generating. The system carefully distinguishes between pathological discharge (major, seven-day, offering required) and normal emission (minor, until evening, water sufficient).'),
            ],
            'sarna': [
                ('15:1–15', 'Sarna: The parallel structure of Lev 15 — chronic male discharge (vv.2–15), normal male emission (vv.16–18), menstrual impurity (vv.19–24), chronic female discharge (vv.25–30) — is deliberately symmetrical. Male and female experience the same categories of impurity in the same order. The system is gender-symmetric in its basic logic, even where the specifics differ.'),
            ],
            'alter': [
                ('15:4–12', 'Alter: The contamination cascade from the person with chronic discharge — bed, chair, saddle, objects touched, persons touching those objects — creates an ever-widening circle of impurity. The priestly imagination maps impurity spatially: it radiates outward from the afflicted body into the surrounding environment and requires constant management.'),
            ],
            'calvin': [
                ('15:1–18', 'Calvin: The discharge laws teach that the body itself is subject to God\'s governance — its functions, its flows, its boundaries. The NT equivalent is Paul\'s instruction to "honour God with your bodies" (1 Cor 6:20). While the specific ceremonies are fulfilled in Christ, the principle of bodily holiness — that the physical self is a temple of the Holy Spirit — derives directly from the Levitical logic.'),
            ],
            'netbible': [
                ('15:13', 'NET Note: The seven-day waiting period after the chronic discharge stops (v.13) parallels the seven-day period after ṣāraʿat-related symptoms abate (Lev 13:4–6). The seven-day structure recurs throughout Lev 12–15 as the standard "observation period" ensuring that a condition has fully resolved before declaring clean.'),
            ],
        },
        {
            'header': 'Verses 19–33 — Female Discharges; Summary of Purity Laws',
            'verses': verse_range(19, 33),
            'heb': [
                ('niddāh', 'niddah', 'menstrual impurity / menstruation / separation', 'The state of ritual impurity during menstruation (7 days). The same term used for childbirth impurity (Lev 12:2). Everything the woman touches during niddāh becomes impure; anyone who touches those things is impure until evening.'),
                ('wĕhizzartem ʾet-bĕnê yiśrāʾēl', 'wehizzartem et-benei yisrael', 'you shall keep the people of Israel separate', 'The purpose of the entire Lev 11–15 purity system: to separate (nāzar) Israel from their impurities so they do not defile the tabernacle in their midst. The purity laws are fundamentally about maintaining the divine dwelling.'),
            ],
            'ctx': 'The female counterparts mirror the male: menstrual impurity (7 days, vv.19–24) mirrors normal male emission; chronic blood discharge (vv.25–30) mirrors chronic male discharge. The chapter closes with the theological rationale (vv.31–33): "You must keep the Israelites separate from things that make them unclean, so they will not die in their uncleanness for defiling my dwelling place." The purity laws exist for one reason: to protect the divine presence that dwells among Israel. Impurity is not sin, but unmanaged impurity threatens the holy space.',
            'cross': [
                ('Mark 5:25–29', 'The woman with twelve-year discharge spent her life under the chronic female discharge rules of Lev 15:25–30 — permanently impure, isolated. When she touches Jesus, the flow stops immediately. Jesus does not become impure; she becomes clean. He is the living anti-ṣāraʿat, the one who purifies rather than being defiled.'),
                ('Rev 22:14–15', '"Blessed are those who wash their robes, that they may have the right to the tree of life… Outside are the dogs, those who practise magic arts, the sexually immoral." The new creation\'s inside/outside binary draws on the Levitical camp structure: clean inside, unclean outside.'),
            ],
            'mac': [
                ('15:31', 'MacArthur: "You must keep the Israelites separate from things that make them unclean, so they will not die in their uncleanness for defiling my dwelling place." This verse is the hermeneutical key to the entire purity system of Lev 11–15. The laws are not about hygiene or moral condemnation — they are about protecting the divine presence. God dwells among Israel; impurity, if unmanaged, contaminates the tabernacle.'),
            ],
            'milgrom': [
                ('15:31', 'Milgrom: This verse is the programmatic statement Milgrom uses to construct his entire theory of the purity system. The impurity laws exist to protect the sanctuary from contamination. Unmanaged impurity "defiles" (ṭimmēʾ) the sanctuary even from a distance — the holy place absorbs the moral and ritual impurity of the camp. The Day of Atonement (Lev 16) will address the accumulated defilement.'),
                ('15:32–33', 'Milgrom: The summary of Lev 15 enumerates: seminal discharge, skin discharge, seminal emission, menstrual impurity, and intercourse with a menstrual woman. The categories are precisely ordered and symmetrical. The priestly writers are systematic legislators, not random collectors of taboos.'),
            ],
            'sarna': [
                ('15:19–24', 'Sarna: The menstrual impurity laws are among the most culturally sensitive in Leviticus. They are not a condemnation of women or of female physiology — they are a ritual management of a natural process. The same God who declared the human body "very good" (Gen 1:31) requires its monthly cycle to be managed with ritual care.'),
            ],
            'alter': [
                ('15:31', 'Alter: The closing rationale — "that they do not defile my tabernacle that is in their midst" — reveals the entire logic of Lev 11–15. The purity laws are not about the body for its own sake but about the body\'s relationship to the divine dwelling. Israel lives with God\'s presence literally in their camp; their bodies must be managed accordingly.'),
            ],
            'calvin': [
                ('15:19–30', 'Calvin: The menstrual impurity laws have been misused to condemn women throughout history. Calvin understood them correctly: they are ritual provisions, not moral condemnations. The woman\'s body is no more "sinful" than the man\'s discharge. Both require the same courtesy of ritual management, the same acknowledgment that even natural processes must be brought within the framework of holiness.'),
            ],
            'netbible': [
                ('15:31', 'NET Note: "So they will not die in their uncleanness" — the penalty for defiling the sanctuary through unmanaged impurity is death. This is consistent with the death of Nadab and Abihu (Lev 10) and with the warning of Lev 22:3. The divine presence is not merely culturally present but lethally holy; its mismanagement is fatal.'),
            ],
        },
    ],
})

print("LEV-3 complete: Leviticus 11–15 built.")

# ─────────────────────────────────────────────────────────────────────────────
# LEV-4: Chapters 16–17 — The Day of Atonement; Blood Prohibition
# ─────────────────────────────────────────────────────────────────────────────

lev(16, {
    'title': 'The Day of Atonement: The Great Annual Purging',
    'sections': [
        {
            'header': 'Verses 1–19 — The High Priest Enters the Most Holy Place',
            'verses': verse_range(1, 19),
            'heb': [
                ('yôm hakkippurîm', 'Yom HaKippurim', 'Day of Atonements / Day of Purgings', 'The most solemn day in Israel\'s calendar. Kippurîm is plural — a plural of intensity or comprehensiveness. On this one day per year, the high priest enters the Most Holy Place to purge the entire sanctuary of the accumulated impurities of the year.'),
                ('ʿăzāʾzēl', 'azazel', 'scapegoat / for Azazel / for complete removal', 'One of the most debated terms in Leviticus. Options: (1) a place name (a remote desert); (2) a demon to whom the goat is symbolically sent; (3) an abstract noun meaning "complete removal." Milgrom argues for "complete removal" — the goat carries the sins of Israel to a place of no return.'),
            ],
            'ctx': 'Yom Kippur is the theological summit of Leviticus — the annual reset of the entire covenant relationship. The high priest performs a unique sequence: sin offering for himself (vv.6, 11–14), sin offering for the people (vv.15–16), and the scapegoat rite (vv.20–22). The key innovation: the high priest enters the Most Holy Place — the inner sanctum where the ark and the mercy seat reside — not just once but twice: once with the bull\'s blood (vv.14–16) and once with the goat\'s blood (v.15). He sprinkles blood on the mercy seat and before it seven times — purging not just the outer altar but the innermost sanctuary. The whole tabernacle is cleansed from top to bottom.',
            'cross': [
                ('Heb 9:7–12', '"But only the high priest entered the inner room, and that only once a year, and never without blood… But when Christ came as high priest… he entered the Most Holy Place once for all by his own blood, thus obtaining eternal redemption."'),
                ('Heb 9:25–26', '"Nor did he enter heaven to offer himself again and again, the way the high priest enters the Most Holy Place every year with blood that is not his own… But he has appeared once for all at the culmination of the ages to do away with sin by the sacrifice of himself."'),
                ('Rom 3:25', '"God presented Christ as a sacrifice of atonement (hilastērion — mercy seat) through the shedding of his blood." Paul uses the LXX word for the mercy seat/atonement cover — the very surface Aaron sprinkled on Yom Kippur.'),
            ],
            'mac': [
                ('16:2–4', 'MacArthur: The elaborate preparation required before the high priest can enter the Most Holy Place — bathing, donning the plain linen garments (not the gold vestments), offering a personal sin offering — underscores the absolute holiness of the divine presence. The ornate garments are set aside; no human glory can be brought into the divine glory.'),
                ('16:12–14', 'MacArthur: The cloud of incense that the high priest must create before entering the Most Holy Place provides a "cover" for the mercy seat — protecting even the high priest from the direct sight of God. The incense is not an aesthetic choice but a protective necessity: no human eye can see the unmediated divine glory and live.'),
                ('16:16–19', 'MacArthur: The blood application to the mercy seat, then the incense altar, then the outer altar purges the entire sanctuary from outer to inner. Milgrom\'s spatial theology is confirmed here: the sanctuary absorbs impurity throughout the year; Yom Kippur purges it all simultaneously.'),
            ],
            'milgrom': [
                ('16:2', 'Milgrom: The prohibition on Aaron entering the Most Holy Place "whenever he chooses" directly recalls the death of Nadab and Abihu (Lev 10:1–2) — the sons who approached without divine authorisation. Yom Kippur provides the one annual authorised entry. Outside of this day, the Most Holy Place is absolutely closed.'),
                ('16:16', 'Milgrom: The blood application to the mercy seat purges (kipper) the sanctuary from the uncleannesses (tumʾōt) of the Israelites — both ritual impurities and moral transgressions (pešāʿîm). Yom Kippur addresses two categories simultaneously: the accumulated ritual impurity that defiled the sanctuary throughout the year, and the deliberate sins that threatened to sever the covenant.'),
            ],
            'sarna': [
                ('16:1–4', 'Sarna: The chapter\'s opening — "After the death of the two sons of Aaron" — places Yom Kippur directly in the aftermath of Nadab and Abihu\'s death. Their fatal approach without authorisation motivates the entire elaborate Yom Kippur procedure: there is a right way and a wrong way to enter the divine presence, and the difference is lethal.'),
            ],
            'alter': [
                ('16:12–13', 'Alter: The high priest enters the Most Holy Place shrouded in fragrant smoke — a man disappearing into a cloud of incense before the ark. The visual is overwhelming: the holiest person in Israel, stripped of his golden vestments, wearing plain linen, hidden in incense smoke, approaching the mercy seat that represents the divine throne. No image in Leviticus is more awesome.'),
            ],
            'calvin': [
                ('16:2–14', 'Calvin: The elaborate preparation of Yom Kippur teaches the absolute holiness of God and the absolute unworthiness of humanity. No human being can approach God on their own terms — not even the high priest in his most solemn moment. Christ alone enters without preparation, without a veil of smoke, without another\'s blood — he enters by his own blood, in his own perfection, into the immediate presence of the Father.'),
            ],
            'netbible': [
                ('16:2', 'NET Note: "The atonement cover" (kappōret) — the golden lid of the ark, flanked by the two cherubim. The LXX translates it hilastērion ("place of propitiation/mercy seat"), the same word Paul uses in Rom 3:25. The mercy seat is the earthly focal point of the divine presence; it is the precise surface that the Yom Kippur blood purges.'),
            ],
        },
        {
            'header': 'Verses 20–34 — The Scapegoat; The Annual Statute',
            'verses': verse_range(20, 34),
            'heb': [
                ('wĕsāmak ʾahărōn ʾet-šĕtê yādāyw', 'wesamach Aharon et-shetei yadav', 'and Aaron shall lay both his hands', 'The double hand-laying (both hands, not the single hand of Lev 1:4) intensifies the transfer. Aaron confesses all Israel\'s sins over the live goat, transferring the full weight of the nation\'s transgressions onto the animal.'),
                ('ʿiwwāh ʿāwōnōt pĕšāʿîm ḥaṭṭāʾōt', 'avonot, pesha\'im, chatta\'ot', 'iniquities, transgressions, sins', 'The triple designation in v.21 is comprehensive — all three Hebrew words for moral failure are named. Yom Kippur addresses the complete range of human wrongdoing: ʿāwōn (iniquity/guilt), peša (rebellion/transgression), and ḥaṭṭāʾt (sin/missing the mark).'),
            ],
            'ctx': 'The scapegoat rite (vv.20–22) is the second half of the two-goat ritual. After the sanctuary has been purged with blood, Aaron lays both hands on the live goat and confesses all Israel\'s sins, transferring them to the animal. A designated man leads it into the wilderness — "a remote place" (ʾereṣ gĕzērāh, a land of cutting off) — where it is released, never to return. The sins are not merely forgiven but removed — carried into the irretrievable wilderness. The chapter closes (vv.29–34) with the permanent statute: Yom Kippur on the 10th of the 7th month (Tishri), a sabbath of rest, fasting, and complete cessation from work. The whole congregation — Israelite and resident foreigner — observes it.',
            'cross': [
                ('Isa 53:6', '"We all, like sheep, have gone astray, each of us has turned to our own way; and the Lord has laid on him the iniquity of us all." Isaiah\'s Servant bears the sins in the scapegoat\'s place — the ʿāwōn of all is laid on one.'),
                ('Heb 13:11–13', '"The high priest carries the blood of animals into the Most Holy Place as a sin offering, but the bodies are burned outside the camp. And so Jesus also suffered outside the city gate to make the people holy through his own blood."'),
                ('Ps 103:12', '"As far as the east is from the west, so far has he removed our transgressions from us." The scapegoat disappears into the wilderness; the Psalm celebrates the permanent removal of sins — the same theological movement.'),
            ],
            'mac': [
                ('16:20–22', 'MacArthur: The double hand-laying and comprehensive confession — "all the wickedness and rebellion of the Israelites — all their sins" — is the most extensive priestly confession in the Torah. The scapegoat bears not just ritual impurity but moral transgression: rebellion (peša) against God\'s authority, iniquity (ʿāwōn) in its guilt-aspect, and sin (ḥaṭṭāʾt) in its general sense.'),
                ('16:29–34', 'MacArthur: Yom Kippur is the only day in the entire Levitical calendar that requires fasting (ʿinnâ nepeš — afflicting the soul). All other feasts are celebrations; this one is marked by self-denial. The people do not feast on this day because the high priest is making atonement before God for them — it is a day of waiting, not celebrating.'),
            ],
            'milgrom': [
                ('16:20–22', 'Milgrom: The scapegoat does not receive the blood of the sin offering — it receives the confession of sins. The two goats together accomplish what one cannot: the blood goat purges the sanctuary (impurity); the scapegoat removes the moral transgressions (sins). Yom Kippur addresses both the ritual and the moral dimensions of Israel\'s covenant failure simultaneously.'),
                ('16:34', 'Milgrom: "This is to be a lasting ordinance for you: Atonement is to be made once a year for all the sins of the Israelites." The once-yearly rhythm is deliberate — the accumulated impurity and sin of an entire year is addressed in a single, comprehensive act. The clean slate is reset annually.'),
            ],
            'sarna': [
                ('16:29', 'Sarna: The inclusion of the resident foreigner (ger) in the Yom Kippur obligation is significant — even non-Israelites living among Israel must observe the fast. The day affects the entire community dwelling in the covenant land, not just the ethnic Israelite. The covenant\'s reach extends to all who live within its territory.'),
            ],
            'alter': [
                ('16:22', 'Alter: "The goat will carry on itself all their sins to a remote place" — the image is stark: a single animal laden with the accumulated moral weight of an entire nation, walking into the wilderness to disappear. The finality of the act is built into the geography: the ʾereṣ gĕzērāh (land of cutting off) is the place of no return. The sins go and do not come back.'),
            ],
            'calvin': [
                ('16:20–22', 'Calvin: The scapegoat is among the most vivid types of Christ in the entire Torah. The double hand-laying, the comprehensive confession, the goat bearing the nation\'s sins away — all fulfilled in Christ, who bore our iniquities into the wilderness of death and did not return under their weight, but rose victorious. The sins are gone because the one who bore them overcame the wilderness.'),
            ],
            'netbible': [
                ('16:22', 'NET Note: "A remote place" (ʾereṣ gĕzērāh) — literally "a land of separation/cutting off." The precise location is unspecified; the point is distance and irreversibility. The Mishnah (Yoma 6:4–8) later specified a cliff near Jerusalem from which the scapegoat was pushed; the biblical text simply requires the wilderness removal.'),
            ],
        },
    ],
})

lev(17, {
    'title': 'The Blood Prohibition: Life Belongs to God',
    'sections': [
        {
            'header': 'Verses 1–9 — All Slaughter at the Tent; No Independent Sacrifice',
            'verses': verse_range(1, 9),
            'heb': [
                ('šāḥaṭ', 'shachat', 'to slaughter / to kill an animal', 'The technical term for the prescribed killing of animals for food or sacrifice. Lev 17:3 extends the requirement that all slaughter must occur at the tent of meeting — essentially prohibiting secular meat-eating for the wilderness period. Every meal involving meat is also a sacrifice.'),
                ('dām yēḥāšēb', 'dam yechashev', 'blood shall be charged / blood-guilt', 'The formula for capital-equivalent guilt: the person who slaughters outside the camp has shed "blood-guilt" — they are morally equivalent to a murderer. The blood of the animal, not properly offered, cries out as Abel\'s blood did.'),
            ],
            'ctx': 'Leviticus 17 is a bridge chapter — it addresses both the sacrificial system (vv.1–9) and the blood prohibition (vv.10–16) that will govern Israelite life in Canaan. The requirement that all slaughter occur at the tent of meeting (vv.3–7) is a wilderness regulation — Deut 12:15–16 relaxes this for life in the land where the sanctuary is distant. The purpose is twofold: to prevent sacrifice to field-demons (śĕʿîrîm, v.7 — goat-demons associated with Canaanite wilderness spirits) and to ensure that all animal life is presented to God before being used by humans.',
            'cross': [
                ('Acts 15:20', 'The Jerusalem Council\'s requirement that Gentile believers abstain from blood — "from the meat of strangled animals and from blood" — directly applies the Lev 17 blood prohibition in the new covenant context.'),
                ('John 6:53–54', '"Unless you eat the flesh of the Son of Man and drink his blood, you have no life in you. Whoever eats my flesh and drinks my blood has eternal life." The shock of this statement depends entirely on the Levitical blood prohibition — blood is never consumed because life belongs to God. Jesus inverting this is the inversion of the entire covenant order.'),
            ],
            'mac': [
                ('17:3–7', 'MacArthur: The prohibition on slaughtering animals outside the tabernacle is one of Leviticus\'s most totalising regulations — it collapses the distinction between sacred and secular. In the wilderness camp, every meal involving meat is a liturgical act. The separation between "ordinary" and "religious" life that modern culture assumes is dismantled.'),
                ('17:7', 'MacArthur: "They must no longer offer any of their sacrifices to the goat idols (śĕʿîrîm) to whom they prostitute themselves." The prohibition on field-slaughter is not merely ritual but anti-idolatrous — Israel had been offering to wilderness spirits in Egypt or in the desert. Every unregulated sacrifice is potentially an act of spiritual adultery.'),
            ],
            'milgrom': [
                ('17:3–4', 'Milgrom: The wilderness regulation requiring all slaughter at the tent is an anti-idolatry measure — it brings the entire food supply under priestly oversight, preventing any animal\'s death from becoming an unsupervised sacrifice to a foreign deity. In Canaan, where the tent is distant, the requirement is modified (Deut 12:15) but the blood prohibition remains absolute.'),
            ],
            'sarna': [
                ('17:7', 'Sarna: The term śĕʿîrîm (goat-demons, satyrs) is rare but revealing — it suggests that some Israelites were offering unofficial sacrifices to wilderness spirits, likely blending YHWH-worship with Canaanite magical practice. Lev 17\'s centralisation requirement is designed to eliminate this syncretism by making all sacrificial activity visible and supervised.'),
            ],
            'alter': [
                ('17:3–5', 'Alter: The extension of sacrifice to cover all killing creates a world in which no animal can be consumed without a priestly dimension. The chapter imagines an Israel in which the boundary between eating and worshipping has been erased — every meat-meal is a form of acknowledgment that life belongs to the one who gave it.'),
            ],
            'calvin': [
                ('17:3–9', 'Calvin: The centralisation of sacrifice teaches the unity of worship — there is one God, one sanctuary, one prescribed way of approach. The proliferation of altars leads inevitably to the proliferation of gods. The NT equivalent: there is one Lord, one faith, one baptism (Eph 4:5). Christian worship is not a private arrangement between the individual and a deity of their choosing.'),
            ],
            'netbible': [
                ('17:7', 'NET Note: "Goat-demons" (śĕʿîrîm) — the same term describes the hairy demons Isaiah mentions inhabiting the desolate Babylon (Isa 13:21). The word\'s root (śāʿar, hairy) connects to goats. Ancient Israelite folk religion appears to have included offerings to wilderness spirits associated with goat-forms — a practice Lev 17 definitively outlaws.'),
            ],
        },
        {
            'header': 'Verses 10–16 — The Blood Prohibition: Life Is in the Blood',
            'verses': verse_range(10, 16),
            'heb': [
                ('kî-hannepeš habāśār baddām hîʾ', 'ki-hanefesh habasar badam hi', 'for the life of the flesh is in the blood', 'The most explicit theological rationale for any Levitical prohibition. Blood = life (nepeš). Since life belongs to God, blood belongs to God. To consume blood is to claim the life-force that is God\'s exclusive possession.'),
                ('wĕʾanî nĕtattîw lākem', 'I have given it to you', 'to make atonement on the altar', 'The blood is both inalienably God\'s AND graciously given by God for Israel\'s atonement. The sacrificial blood does not come from Israel\'s own resources — God provides, from his own domain, the means of Israel\'s atonement.'),
            ],
            'ctx': 'Verses 11 and 14 contain the most profound theological statement about blood in the entire Bible: "For the life (nepeš) of a creature is in the blood, and I have given it to you to make atonement for yourselves on the altar; it is the blood that makes atonement for one\'s life." Three claims: (1) blood = life; (2) life = God\'s domain; (3) God graciously designated blood as the atoning medium. The prohibition is therefore not arbitrary — it is grounded in the deepest reality of creation and covenant: life belongs to the Creator, and the Creator has given the blood-life to cover Israel\'s debt. To consume blood is to consume what God has reserved for atonement.',
            'cross': [
                ('John 1:29', '"Look, the Lamb of God, who takes away the sin of the world!" John the Baptist\'s declaration applies the Levitical blood-atonement logic to Christ: the life in his blood is the life that atones.'),
                ('1 Pet 1:18–19', '"You were redeemed… with the precious blood of Christ, a lamb without blemish or defect." The blood of Christ is precious precisely because the life is in the blood — and his life is the divine life, infinitely valuable.'),
                ('Heb 9:22', '"Without the shedding of blood there is no forgiveness." The writer of Hebrews states the Lev 17:11 principle as a universal axiom governing the entire economy of atonement.'),
            ],
            'mac': [
                ('17:11', 'MacArthur: Leviticus 17:11 is the theological key to the entire sacrificial system: "It is the blood that makes atonement for one\'s life." The atoning blood is not a human offering — it is God\'s own provision. He designates the blood as the medium of atonement; the worshipper brings it but does not own it. The entire sacrificial system is grace — God providing for human approach to God.'),
                ('17:13–14', 'MacArthur: The blood prohibition extends to game animals — when a hunter kills a wild animal, the blood must be poured out and covered with earth (v.13). The act of covering the blood with earth echoes the ground receiving Abel\'s blood (Gen 4:10). Blood poured out is returned to the earth from which it came; it acknowledges that the life-force belongs to the ground and to God, not to the hunter.'),
            ],
            'milgrom': [
                ('17:11', 'Milgrom: This verse is the pivotal statement of Levitical theology. The logic: life (nepeš) = blood; blood = God\'s property; therefore blood = atonement medium. The one offering blood is not giving his own property — he is presenting God\'s designated atonement token back to God. Milgrom argues this makes the entire sacrificial system a divine gift, not a human achievement.'),
                ('17:14', 'Milgrom: The twofold repetition of the blood-life equation (vv.11 and 14) with the repeated prohibition creates a rhetorical intensity: the blood prohibition is among the Torah\'s most absolute. Its violation — like the violation of the fat prohibition — incurs kārēt.'),
            ],
            'sarna': [
                ('17:11', 'Sarna: The formulation "I have given it to you" positions God as the gracious donor of the atonement mechanism. Israel did not invent blood sacrifice; God designated it. This transforms the sacrificial system from a human attempt to appease a deity into a divine provision for human restoration — a fundamentally different theological register.'),
            ],
            'alter': [
                ('17:11', 'Alter: "For the life of the flesh is in the blood, and I have given it to you upon the altar to make atonement for your lives." The syntactic structure is remarkable: the prohibition\'s rationale and the gracious provision are stated in the same breath. God forbids consuming blood AND simultaneously gives blood its sacred purpose. The same substance that is prohibited for food is given for atonement.'),
            ],
            'calvin': [
                ('17:10–14', 'Calvin: The blood prohibition teaches the profound reverence we owe to the life that God has given. Every living creature\'s blood is a sacrament of the life that belongs to its Creator. When Christ spills his blood, he is giving the ultimate life — his own divine-human life — as the final and definitive atonement. The Levitical prohibition is the grammar that makes the cross intelligible.'),
            ],
            'netbible': [
                ('17:11', 'NET Note: "Nepeš" (life/soul/self) is typically translated "life" in this context. The equation nepeš = blood = atonement has generated extensive theological debate. The text does not say blood is the nepeš, but that the nepeš of the flesh is "in" (bĕ) the blood — a locative, not an identity statement. The life-force resides in the blood; blood is the carrier and symbol of life, not life itself.'),
            ],
        },
    ],
})

print("LEV-4 complete: Leviticus 16–17 built.")

# ─────────────────────────────────────────────────────────────────────────────
# LEV-5: Chapters 18–22 — The Holiness Code (First Part)
# ─────────────────────────────────────────────────────────────────────────────

lev(18, {
    'title': 'Sexual Ethics: You Shall Not Do as They Do',
    'sections': [
        {
            'header': 'Verses 1–18 — Prohibited Marriages and Sexual Relations',
            'verses': verse_range(1, 18),
            'heb': [
                ('qĕdōšîm tihyû', 'qedoshim tihyu', 'you shall be holy', 'The repeated imperative of the Holiness Code (Lev 17–26). Holiness is not an aspiration but a covenant obligation. The phrase frames the entire ethical section: Israel\'s conduct must reflect the character of the God who chose them.'),
                ('kĕmaʿăśēh ʾereṣ-miṣrayim', 'kema\'aseh eretz-Mitzrayim', 'according to the deeds of Egypt', 'The negative frame for the sexual ethics: Israel must not replicate the practices of Egypt (the land they left) or Canaan (the land they are entering). The holiness code is explicitly counter-cultural.'),
            ],
            'ctx': 'Leviticus 18 opens the Holiness Code (Lev 17–26) with an extensive list of prohibited sexual relationships. The structure: introduction (vv.1–5, do not do as Egypt and Canaan do), prohibited family relationships (vv.6–18), prohibited acts (vv.19–23), theological rationale and warning (vv.24–30). The family prohibitions are graduated: parent, stepparent, sibling, half-sibling, grandchild, aunt, uncle\'s wife, daughter-in-law, sister-in-law, a woman and her daughter. The common thread is kinship — the sexual act creates a "one flesh" bond that, within the family, would create destructive boundary-crossing.',
            'cross': [
                ('1 Cor 5:1', '"It is actually reported that there is sexual immorality among you, and of a kind that even pagans do not tolerate: A man is sleeping with his father\'s wife." Paul applies Lev 18:8 directly to the Corinthian situation.'),
                ('Matt 5:27–28', '"You have heard that it was said, \'You shall not commit adultery.\' But I tell you that anyone who looks at a woman lustfully has already committed adultery with her in his heart." Jesus deepens the Levitical sexual ethics from act to motive.'),
                ('1 Thess 4:3–5', '"It is God\'s will that you should be sanctified: that you should avoid sexual immorality; that each of you should learn to control your own body in a way that is holy and honourable."'),
            ],
            'mac': [
                ('18:1–5', 'MacArthur: The framing — "do not do as Egypt, do not do as Canaan" — establishes the sexual ethics as counter-cultural identity markers. Israel\'s sexual boundaries are not merely prudential rules but covenant obligations that distinguish them from the nations. The Holiness Code assumes that the surrounding cultures have abandoned divine order; Israel is called back to creation norms.'),
                ('18:6–18', 'MacArthur: The prohibited family relationships are comprehensive and graduated because the family is the basic covenant unit. Sexual violation within the family destroys the primary institution of covenant life. The catalogue from parent to daughter-in-law covers every significant kinship relationship — the family network is to be a domain of protection, not exploitation.'),
            ],
            'milgrom': [
                ('18:6', 'Milgrom: The phrase "to uncover nakedness" (gālāh ʿerwāh) is a euphemism for sexual intercourse. It also carries a legal resonance — uncovering one\'s relative\'s nakedness exposes and dishonours the family as a whole. The act is both sexual and social: it violates both the individual and the family\'s integrity.'),
                ('18:24–25', 'Milgrom: The theological rationale for the sexual ethics is stark: the land itself vomits out inhabitants who defile it with these acts. Milgrom notes that the land is pictured as a moral subject — capable of being defiled and capable of rejecting its inhabitants. This is not superstition but a sophisticated metaphor for the moral consequences built into creation itself.'),
            ],
            'sarna': [
                ('18:3–5', 'Sarna: The life/practices contrast — "keep my decrees and laws… the person who obeys them will live by them" — is one of the most important ethical formulas in the Torah. Life-by-obedience is not salvation by works but covenant vitality: those who live within God\'s order flourish; those who transgress it destroy themselves.'),
            ],
            'alter': [
                ('18:6', 'Alter: "None of you shall approach any close relative to uncover nakedness" — the initial prohibition covers all cases, then the specific cases follow. The rhetorical structure is deductive: the general principle first, the specific applications second. This is characteristic of the Holiness Code\'s legislative style.'),
            ],
            'calvin': [
                ('18:6–18', 'Calvin: The prohibited family relationships reflect the divine design for the family as a protected sphere of unconditional care. Where sexuality enters, the unconditional quality of family love is corrupted — the family member becomes an object of desire rather than a subject of care. The prohibitions protect the family as a domain of covenant faithfulness.'),
            ],
            'netbible': [
                ('18:5', 'NET Note: "The person who obeys them will live by them" (ʾăšer yaʿăśeh ʾōtām hāʾādām wāḥay bāhem) — Paul quotes this verse in Rom 10:5 and Gal 3:12 in his argument about law and faith. He does not deny the life-giving quality of obedience but argues that no human being consistently obeys, making the law\'s life-promise unattainable apart from Christ.'),
            ],
        },
        {
            'header': 'Verses 19–30 — Further Prohibitions; the Land\'s Warning',
            'verses': verse_range(19, 30),
            'heb': [
                ('wĕlōʾ-tittēn miṣzarʿăkā', 'you shall not give your seed', 'lĕhaʿăbîr lammōlek — to Molech', 'The Molech prohibition appears here in the sexual ethics section — child sacrifice is treated as a form of sexual-religious transgression, a desecration of the offspring (zeraʿ, seed) that belongs to God.'),
                ('tôʿēbāh', 'to\'evah', 'abomination / detestable thing', 'The strongest Hebrew term of moral revulsion — used for practices that are fundamentally incompatible with the covenant order. In Lev 18–20 it applies to prohibited sexual acts and idolatry.'),
            ],
            'ctx': 'Verses 19–23 add four further prohibitions: menstrual intercourse (v.19), adultery (v.20), Molech child sacrifice (v.21), and male homosexual intercourse (v.22), and bestiality (v.23). The Molech prohibition is striking in this context — child sacrifice is not primarily addressed as a homicide but as a sexual-covenantal transgression: you are giving your "seed" (zeraʿ, the same word for semen/offspring) to a foreign deity. The chapter closes (vv.24–30) with the theological rationale: the Canaanites committed these acts and the land vomited them out. Israel will face the same fate if they follow the same path.',
            'cross': [
                ('Rom 1:24–27', '"Therefore God gave them over in the sinful desires of their hearts to sexual impurity… Even their women exchanged natural sexual relations for unnatural ones. In the same way the men also abandoned natural relations with women and were inflamed with lust for one another." Paul situates sexual disorder as a consequence of idolatry — the same theological connection Lev 18:21–22 makes.'),
                ('2 Kgs 23:10', '"He desecrated Topheth, which was in the Valley of Ben Hinnom, so no one could use it to sacrifice their son or daughter in the fire to Molek." Josiah\'s reform directly addresses the Molech prohibition of Lev 18:21.'),
            ],
            'mac': [
                ('18:21', 'MacArthur: The Molech prohibition connects child sacrifice to sexual sin because both represent the misuse of the generative power God has given. "Your seed" (zeraʿ) is your offspring — given by God, belonging to God. To give it to Molech is to desecrate the covenant by directing what is holy to what is abominable.'),
                ('18:24–30', 'MacArthur: The warning that the land "vomited out" its inhabitants (vv.25, 28) is one of the most graphic images in Leviticus. The land is not merely a physical space but a moral environment — it reacts to moral contamination. Israel is warned explicitly: what happened to the Canaanites will happen to them if they adopt Canaanite practices.'),
            ],
            'milgrom': [
                ('18:22', 'Milgrom: The male homosexual prohibition is stated baldly — "Do not lie with a man as one lies with a woman; it is tôʿēbāh." Milgrom notes the term tôʿēbāh is reserved for acts that violate the created order — the same term applied to idolatry (Deut 7:25). The act is categorised as a creation-order violation, not merely a social infraction.'),
                ('18:24–28', 'Milgrom: The land-vomiting metaphor is unique to Lev 18 in the Torah. Milgrom\'s analysis: the land is imaged as a digestible organism — it ingests its inhabitants, and if they corrupt it with these acts, it ejects them. The metaphor is both ecological and covenantal: the land and the covenant are bound together.'),
            ],
            'sarna': [
                ('18:24–30', 'Sarna: The explicit comparison to the Canaanites is a form of historical argument: this is not new legislation but a recognition of the natural law that has always governed human sexuality. The Canaanites were expelled not because they violated Israelite law but because they violated the creation order that precedes and underlies all covenant law.'),
            ],
            'alter': [
                ('18:28', 'Alter: "And so the land will not vomit you out when you defile it, as it vomited out the nations that were before you." The subjunctive ("so that it will not") contains the warning: the vomiting is not inevitable but contingent on Israel\'s conduct. The land has a choice; so does Israel. The chapter is as much threat as prohibition.'),
            ],
            'calvin': [
                ('18:24–30', 'Calvin: The land-vomiting metaphor teaches that the moral order is not merely legal but ontological — built into the structure of creation. Societies that systematically violate sexual ethics destroy themselves; they are "vomited out" by the creation order they have violated. History confirms this repeatedly. The laws of Lev 18 are not arbitrary cultural norms but reflections of the created order.'),
            ],
            'netbible': [
                ('18:21', 'NET Note: "Molech" (hammolek) — a deity associated with child sacrifice, worshipped in the Valley of Hinnom (Topheth). The identity of Molech is debated: a specific Canaanite deity, a general term for a type of votive offering, or a vocalization of "king" (melek) with the vowels of "shame" (bōšet). The practice is condemned throughout the OT (Lev 20:2–5; 2 Kgs 16:3; 21:6; 23:10; Jer 32:35).'),
            ],
        },
    ],
})

lev(19, {
    'title': 'The Holiness of Daily Life: Love Your Neighbour',
    'sections': [
        {
            'header': 'Verses 1–18 — Love of God and Neighbour in Daily Conduct',
            'verses': verse_range(1, 18),
            'heb': [
                ('wĕʾāhabtā lĕrēʿăkā kāmōkā', 'veahavta lere\'acha kamocha', 'you shall love your neighbour as yourself', 'The famous summary verse (v.18b) is embedded in a list of specific laws about harvest gleanings, theft, lying, worker\'s wages, the disabled, justice, and gossip. Love of neighbour is not abstract sentiment but specific practice.'),
                ('ʾănî yhwh', 'ani YHWH', 'I am the Lord', 'The formula appears 16 times in Lev 19 — after almost every commandment. The divine self-identification is both warrant and motivation: God\'s own character grounds each requirement. Israel must be honest because God is faithful; must be just because God is just.'),
            ],
            'ctx': 'Leviticus 19 is the ethical heart of the Holiness Code and arguably the most concentrated ethical teaching in the Torah. It opens with the Holiness Formula ("be holy because I, the Lord your God, am holy") and then proceeds through an extraordinary range of practical commands: leaving harvest edges for the poor (vv.9–10), honest weights (v.35–36), no gossip (v.16), rising before the elderly (v.32), welcoming the foreigner (vv.33–34), and the climax: "love your neighbour as yourself" (v.18). The chapter spans ritual (Sabbath, idolatry, sacrificial regulations) and ethical (theft, lying, justice, wages) without distinction — both are expressions of the one holiness.',
            'cross': [
                ('Matt 22:39', '"And the second is like it: Love your neighbour as yourself." Jesus identifies Lev 19:18 as the second greatest commandment. All the Law and the Prophets hang on this and the Shema.'),
                ('Rom 13:9', '"The commandments… are summed up in this one command: \'Love your neighbour as yourself.\'"'),
                ('Jas 2:8', '"If you really keep the royal law found in Scripture, \'Love your neighbour as yourself,\' you are doing right."'),
            ],
            'mac': [
                ('19:2', 'MacArthur: The Holiness Formula — "be holy because I, the Lord your God, am holy" — is the governing principle of the entire chapter. Every specific command that follows (gleaning laws, honest weights, care for the disabled) is grounded in God\'s own character. Ethics in Leviticus is not rule-following but character-formation: becoming like the God who gave the commands.'),
                ('19:9–10', 'MacArthur: The gleaning laws are one of the OT\'s most practical provisions for the poor. The farmer does not harvest to the edge or pick up fallen grain — the poor and the foreigner have a right to glean what remains. This is not charity (optional generosity) but justice (mandated provision). The poor have a legal claim on the margins of Israel\'s prosperity.'),
            ],
            'milgrom': [
                ('19:18', 'Milgrom: "Love your neighbour as yourself" in context means: love one who is a member of your covenant community as you love yourself — do not take revenge or bear a grudge (vv.17–18a), but actively seek the good of the other as you seek your own. The extension to the foreigner (v.34, "love him as yourself") universalises the principle.'),
                ('19:1–2', 'Milgrom: The Holiness Formula in Lev 19:2 is unique in that it addresses the entire congregation ("speak to all the congregation of Israel"), not just Aaron or the priests. The call to holiness in Lev 19 is democratic — every Israelite, not only the priesthood, is called to embody God\'s character.'),
            ],
            'sarna': [
                ('19:9–10', 'Sarna: The gleaning laws (peʾāh, the corner of the field, and leftovers) institutionalise care for the poor as a legal right rather than a voluntary act. The farmer does not own the corners of his field — the poor have a prior claim. This is one of the Torah\'s most concrete expressions of the principle that private property has social obligations.'),
            ],
            'alter': [
                ('19:18', 'Alter: "Love your neighbour as yourself" appears at the climax of a series of prohibitions: no revenge, no grudge-bearing, rebuke your fellow rather than carry silent resentment. The love commanded is not emotional sentiment but active loyalty — the same practical commitment to another\'s flourishing that we naturally bring to our own welfare.'),
            ],
            'calvin': [
                ('19:9–18', 'Calvin: Leviticus 19 demonstrates that the law of holiness and the law of love are inseparable. The same chapter that commands "be holy" also commands gleaning laws, fair wages, care for the disabled, honest weights, and love of neighbour. Holiness is not ritual purity alone but the entire character of a life conformed to God\'s own generous, just, faithful nature.'),
            ],
            'netbible': [
                ('19:18', 'NET Note: "Your neighbour" (rēʿăkā) in v.18 is contextually an Israelite covenant-member; "the foreigner residing among you" (gēr) in v.34 receives the same command. The scope of "neighbour" is extended across the chapter. Jesus\'s parable of the Good Samaritan (Luke 10:25–37) shows that the extension continues: neighbour is whoever is in need before you.'),
            ],
        },
        {
            'header': 'Verses 19–37 — Practical Holiness: Mixtures, Morality, and the Foreigner',
            'verses': verse_range(19, 37),
            'heb': [
                ('kilʾayim', 'kilayim', 'mixture / two kinds', 'The prohibition on mixing: two kinds of animals mating, two kinds of seed in one field, two kinds of fabric in one garment. The kilʾayim laws enact the creation order — God separated (bādal) the kinds in Gen 1; Israel must maintain those separations.'),
                ('gēr', 'ger', 'foreigner / resident alien', 'The person who is not ethnic Israelite but lives within the covenant community. Lev 19:33–34 is one of the most radical passages in the ancient world: the foreigner receives the same love-command as the native-born. The memory of Egypt grounds the obligation.'),
            ],
            'ctx': 'The second half of Lev 19 extends the holiness vision across a wider range of life: mixture prohibitions (v.19) that maintain creation order; sexual exploitation laws (vv.20–22) for enslaved women; first-fruit timing requirements (vv.23–25); prohibitions on mourning-body-marking (vv.27–28) that distance Israel from Canaanite death-cult practices; respect for mediums (v.31) and the elderly (v.32); equal justice for the foreigner (vv.33–34); and honest weights (vv.35–36). The chapter closes with the Exodus motivation: "I am the Lord your God, who brought you out of Egypt."',
            'cross': [
                ('Gal 3:28', '"There is neither Jew nor Gentile, neither slave nor free, nor is there male and female, for you are all one in Christ Jesus." The foreigner-inclusion of Lev 19:33–34 reaches its fulfilment in the unity of all peoples in Christ.'),
                ('Amos 8:5', '"Skimping on the measure, boosting the price and cheating with dishonest scales." Amos indicts Israel for violating the honest weights law of Lev 19:35–36 — the prophets hold Israel accountable to the Holiness Code.'),
            ],
            'mac': [
                ('19:33–34', 'MacArthur: The foreigner-love command — "love him as yourself, for you were foreigners in Egypt" — is the most expansive neighbourliness law in the Torah. The memory of Egyptian oppression becomes the motivation for Israeli generosity: you know what it is to be vulnerable in a foreign land; do not treat others as Egypt treated you. Redemptive history creates ethical obligation.'),
                ('19:35–36', 'MacArthur: Honest weights and measures are among the most frequently violated economic laws in Israel\'s history (Amos 8:5; Mic 6:11; Prov 11:1). The specification of ephah (dry measure), hin (liquid measure), and shekel (weight) covers the full range of commercial transactions. Economic honesty is holiness.'),
            ],
            'milgrom': [
                ('19:19', 'Milgrom: The mixture prohibitions (kilʾayim) are among the most puzzling laws in Leviticus. Milgrom\'s analysis: they maintain the categories established in creation (Gen 1\'s \'according to their kind\'). To hybridise is to undo the created order. The prohibitions are not about practical harm but about theological order: the created distinctions are sacred.'),
                ('19:34', 'Milgrom: "For you were foreigners in Egypt" — this is the only place where the Exodus experience is cited as the direct motivation for a Lev 19 command. Elsewhere the formula is \'I am the Lord your God.\'  Here the motivation is empathetic memory: your historical experience of vulnerability obligates you to protect others\' vulnerability.'),
            ],
            'sarna': [
                ('19:32', 'Sarna: "Rise in the presence of the aged, show respect for the elderly" — one of the most specific honour commands in the Torah. The Hebrew literally means \'you shall rise before the white hair\' (šêbāh). The obligation is bodily — a physical act of deference that signals the entire community\'s value of wisdom and accumulated experience.'),
            ],
            'alter': [
                ('19:34', 'Alter: "The foreigner residing among you must be treated as your native-born. Love him as yourself, for you were foreigners in Egypt. I am the Lord your God." Five clauses building on each other: command, equivalent status, motivation (shared experience), command intensified (as yourself), divine self-identification. The foreigner is not to be tolerated but loved.'),
            ],
            'calvin': [
                ('19:35–36', 'Calvin: The honest weights and measures laws demonstrate that commerce is a theological matter. Every transaction in which someone cheats on measure is a lie about reality — a violation of the truthfulness that God\'s own character demands. The merchant who uses false weights is not merely breaking a commercial rule; they are defaming the God of truth in whom they claim to believe.'),
            ],
            'netbible': [
                ('19:27', 'NET Note: "Do not cut the hair at the sides of your head or clip off the edges of your beard" — the prohibition targets specific Canaanite mourning practices associated with the dead (cf. Deut 14:1; Jer 16:6). The body-marking associated with death-cult religion (tattoos, v.28; consulting the dead, v.31) would blur the boundary between Israel and the surrounding death-religion cultures.'),
            ],
        },
    ],
})

lev(20, {
    'title': 'Penalties for Violations: The Holiness Code Enforced',
    'sections': [
        {
            'header': 'Verses 1–16 — Death Penalties: Molech, Mediums, Sexual Violations',
            'verses': verse_range(1, 16),
            'heb': [
                ('môt yûmāt', 'mot yumat', 'he shall surely be put to death', 'The double verb of absolute certainty — the infinitive absolute intensifying the finite verb. "He shall surely die." The death penalty formula appears 7 times in Lev 20. The repetition signals that these are the most serious covenant violations.'),
                ('wĕkārettî ʾōtô', 'vechareti oto', 'I will cut him off', 'The divine kārēt — executed by God rather than the community. Some violations receive human death penalty; others receive divine cutting off. Milgrom distinguishes: human execution for public violations; divine kārēt for violations difficult to witness or prove.'),
            ],
            'ctx': 'Leviticus 20 is the penal companion to Lev 18–19 — it specifies the consequences for the acts prohibited in the earlier chapters. The structure moves from most severe (death: Molech sacrifice, v.2; mediums, v.6; parent-cursing, v.9; adultery, v.10) through graduated sexual violations to the holiness summary (vv.22–26). The chapter confronts modern readers most directly at vv.13 (male homosexual intercourse) and v.15–16 (bestiality) — both receive death penalties. The theological logic: these acts are tôʿēbāh (abomination) — fundamentally incompatible with the covenant order, not merely culturally offensive.',
            'cross': [
                ('Matt 15:4', '"God said, \'Honour your father and mother\' and \'Anyone who curses their father or mother is to be put to death.\'" Jesus quotes Lev 20:9 to confront the Pharisees who allowed legal loopholes to dishonour parents.'),
                ('1 Cor 6:9–11', '"Do you not know that wrongdoers will not inherit the kingdom of God?… And that is what some of you were. But you were washed, you were sanctified, you were justified in the name of the Lord Jesus Christ." Paul lists violations of Lev 20\'s sexual ethics and then pronounces the gospel: transformation is possible.'),
            ],
            'mac': [
                ('20:1–5', 'MacArthur: The death penalty for Molech-sacrifice (v.2 — stoning by the community) is the highest public enforcement in Leviticus. The community itself executes the penalty — they are all implicated in maintaining covenant holiness. If the community fails to act, God himself will act against both the perpetrator and those who "close their eyes" to the sin (v.4).'),
                ('20:10', 'MacArthur: The death penalty for adultery (both parties) reflects the gravity of covenant betrayal — adultery destroys the family unit, which is the basic covenant institution, and violates the one-flesh bond created by God. The NT does not prescribe execution for adultery, but Jesus\'s teaching on the permanence of marriage (Matt 19:6) maintains the theological weight of the covenant.'),
            ],
            'milgrom': [
                ('20:2–5', 'Milgrom: The Molech penalty — stoning by the community — is the same as for murder (Num 35:16–21). Child sacrifice is categorised as equivalent to murder in the Levitical system. The community\'s responsibility to execute the penalty is a collective covenant obligation: tolerating Molech worship is not neutrality but complicity.'),
                ('20:13', 'Milgrom: The death penalty for male homosexual intercourse is the same as for adultery (v.10) — both are treated as capital covenant violations. Milgrom\'s analysis: the act violates the created order (Gen 1:27–28\'s male-female complementarity and the mandate to fill the earth) and is categorised as tôʿēbāh — abomination — the same term as in 18:22.'),
            ],
            'sarna': [
                ('20:9', 'Sarna: The parent-cursing penalty (death) reflects the Torah\'s elevation of parental honour to near-divine status. Parents represent the chain of covenant transmission — they are the immediate source of the child\'s life and covenant identity. To curse them is to curse the covenant itself.'),
            ],
            'alter': [
                ('20:7–8', 'Alter: "Consecrate yourselves and be holy, because I am the Lord your God. Keep my decrees and follow them. I am the Lord, who makes you holy." The chapter begins and ends with the Holiness Formula. The penalties are framed by theology — they are not arbitrary punishments but the covenant\'s protective response to acts that threaten the community\'s holy identity.'),
            ],
            'calvin': [
                ('20:1–16', 'Calvin: The severity of the penalties in Lev 20 teaches that God does not treat covenant violations lightly. The same gracious God who provided the sacrificial system and the Day of Atonement also established consequences for deliberate, persistent covenant breach. Grace does not abolish accountability; it provides the only path through it.'),
            ],
            'netbible': [
                ('20:2', 'NET Note: "The people of the land shall stone him" — the death penalty for Molech sacrifice is carried out by the community, not by the priests or a designated executioner. The community\'s collective action signals collective responsibility: covenant holiness is a communal project, not a matter of individual private faith.'),
            ],
        },
        {
            'header': 'Verses 17–27 — Further Sexual Violations; The Holiness Summary',
            'verses': verse_range(17, 27),
            'heb': [
                ('ḥesed hûʾ', 'chesed hu', 'it is a disgrace / it is a reproach', 'Used in v.17 for sibling incest — the only place in Lev 20 where this term appears instead of tôʿēbāh or death penalty. The word ḥesed usually means lovingkindness; here in a negative construction it means its opposite — a social shame, a public disgrace.'),
                ('wĕhāyîtem lî qĕdōšîm', 'vehayitem li qedoshim', 'you shall be holy to me', 'The chapter\'s summary formula — not merely "be holy" but "be holy to me" (lî). Holiness is relational; it is not an abstract quality but a covenantal orientation toward the God who chose Israel.'),
            ],
            'ctx': 'The second half of Lev 20 continues the sexual violation penalties at lower levels: kārēt for aunt-uncle incest (vv.17–21), childlessness as divine penalty (vv.20–21), exile for mediums (v.27). The theological summary (vv.22–26) restates the Leviticus themes: the land will vomit you out if you defile it; I am the Lord who separated you from the nations as I separated clean from unclean animals. The separation language explicitly links Israel\'s ethical distinctiveness to the purity system of Lev 11: just as Israel distinguishes clean from unclean in diet, so they must distinguish holy from common in conduct.',
            'cross': [
                ('1 Pet 2:9', '"But you are a chosen people, a royal priesthood, a holy nation, God\'s special possession, that you may declare the praises of him who called you out of darkness into his wonderful light." Peter applies the Lev 20:26 separation language to the church: set apart as Israel was set apart.'),
                ('2 Cor 6:17', '"\'Come out from them and be separate,\' says the Lord." Paul echoes the Levitical separation call for the NT community.'),
            ],
            'mac': [
                ('20:22–26', 'MacArthur: The holiness summary at Lev 20\'s close is the most comprehensive statement of the relationship between ethics and election in the Holiness Code. God separated Israel from the nations as he separated clean from unclean animals — the same verb (bādal) used in Gen 1 for God\'s creative separations. Israel\'s moral distinctiveness is grounded in the doctrine of election and the structure of creation.'),
            ],
            'milgrom': [
                ('20:22–26', 'Milgrom: The summary equation — "I have set you apart from the nations to be my own, just as I have set apart clean animals from unclean ones" — is the hermeneutical key to the entire purity-ethics complex of Lev 11–20. The same God who structured the created order (clean/unclean) also structured the social order (holy Israel/the nations). Both reflect divine bādal (separation).'),
            ],
            'sarna': [
                ('20:26', 'Sarna: "You are to be holy to me because I, the Lord, am holy, and I have set you apart from the nations to be my own." The chain: God is holy → Israel is to be holy → therefore Israel is separated. Holiness is not self-generated but derived — Israel\'s distinctiveness flows from the character of the God who chose them.'),
            ],
            'alter': [
                ('20:26', 'Alter: "I have set you apart from the nations to be my own." The verb qādaš (to be holy, to set apart) connects Israel\'s ethical call to the priestly vocabulary of consecration. Israel as a people is consecrated — "holy to the Lord" — the same formula used for priests and the first-born. The entire nation is a priestly people.'),
            ],
            'calvin': [
                ('20:22–26', 'Calvin: The holiness summary teaches that Christian distinctiveness is not cultural preference but theological necessity. As Israel was to be different from Egypt and Canaan, the church is to be different from the world — not in withdrawal but in the quality of its life together. The church\'s ethics are a form of witness: they declare the character of the God who has separated his people to himself.'),
            ],
            'netbible': [
                ('20:26', 'NET Note: "I have set you apart from the nations to be my own" — the Hiphil of bādal, the same verb God uses in Gen 1 to separate light from darkness, water from water, land from sea. Israel\'s election is portrayed as a creative act analogous to the ordering of creation. Their distinctiveness is cosmological, not merely cultural.'),
            ],
        },
    ],
})

lev(21, {
    'title': 'The Holiness of the Priests: Higher Standards for Higher Calling',
    'sections': [
        {
            'header': 'Verses 1–15 — Mourning Restrictions and Marriage Requirements for Priests',
            'verses': verse_range(1, 15),
            'heb': [
                ('lōʾ yiṭṭammāʾ', 'lo yittama', 'he shall not make himself unclean', 'The Hithpael reflexive — deliberately incurring impurity. Ordinary Israelites incur impurity involuntarily (contact with a corpse); priests are prohibited even from the voluntary mourning practices that would incur corpse-impurity. Their proximity to the holy demands greater separation from the impure.'),
                ('qĕdōšô lēlōhāyw', 'qedosho lElohav', 'holy to his God', 'The phrase applied to the priest in v.7 and v.8 — the priest is "holy to his God" in a heightened sense. His holiness is greater than the ordinary Israelite\'s holiness, because he ministers in the holy place. Higher access to the holy requires higher separation from the impure.'),
            ],
            'ctx': 'Leviticus 21 applies the holiness logic to the priesthood specifically — priests must observe stricter purity requirements than ordinary Israelites because they minister in the sanctuary. Ordinary priests: may mourn only immediate family members (vv.1–4); may not marry divorced women or prostitutes (v.7). The high priest: must not mourn even his parents (v.11); must marry a virgin from his own people (v.13–14). The principle is graduated holiness: the closer the approach to the divine presence, the greater the separation from impurity required. The high priest represents Israel before God at its most intimate — his entire personal life must reflect that calling.',
            'cross': [
                ('Heb 7:26', '"Such a high priest truly meets our need — one who is holy, blameless, pure, set apart from sinners, exalted above the heavens." The writer of Hebrews describes Christ using the vocabulary of priestly qualification — he is the ultimate realisation of Lev 21\'s high-priestly ideal.'),
                ('1 Tim 3:2–7', 'Paul\'s qualifications for church overseers — "above reproach, faithful to his wife… self-controlled, respectable… not given to drunkenness" — follow the Levitical pattern: higher leadership requires higher character.'),
            ],
            'mac': [
                ('21:1–4', 'MacArthur: The restriction on priestly mourning is not a denial of grief but a recognition that priestly service cannot be interrupted. Death creates impurity; the priest who incurs impurity cannot minister. The law creates a tragic hierarchy: for the ordinary priest, only parents, children, siblings, and unmarried sister may be mourned; for the high priest (v.11), not even these. The demand of the holy supersedes the demands of grief.'),
                ('21:13–15', 'MacArthur: The high priest\'s marriage requirements — a virgin, from his own people (v.13–15) — are the most restrictive in Israel. The high priest\'s household is to be beyond reproach: no divorce, no prostitution, no widow. The logic: the high priest\'s offspring continue the priestly line; the holiness of the priesthood must be reproduced in each generation.'),
            ],
            'milgrom': [
                ('21:1–4', 'Milgrom: The graduated mourning restrictions reveal the layered holiness structure of Israel: lay Israelite (no mourning restrictions), ordinary priest (restricted to immediate family), high priest (no mourning at all). This ladder of holiness corresponds inversely to proximity to the divine presence — the closer to God, the greater the separation from death.'),
                ('21:7', 'Milgrom: The priest\'s marriage restriction — not a prostitute, not a divorced woman — serves the same holiness logic as the mourning restrictions. The priest\'s household is an extension of his priestly identity; its moral status reflects on his fitness for service. A priest whose household is disordered brings that disorder into the sanctuary.'),
            ],
            'sarna': [
                ('21:10–12', 'Sarna: The high priest\'s prohibition on all mourning — even for his father or mother — is the most demanding personal requirement in the entire Levitical system. His function as the representative of all Israel before God is so total that it supersedes even the most basic human obligations. The high priest\'s life is entirely consumed by his office.'),
            ],
            'alter': [
                ('21:10–12', 'Alter: The high priest "must not leave the sanctuary of his God or desecrate it" even when a family member dies. The phrase "desecrate his God\'s sanctuary" reveals the high priest\'s unique status: his person is identified with the sanctuary. His mourning would be its defilement; his grief would be its dishonour. He is the sanctuary made flesh.'),
            ],
            'calvin': [
                ('21:1–15', 'Calvin: The priestly holiness requirements teach that spiritual leadership imposes genuine constraints on personal freedom — the leader\'s private life is not separate from their public office. Ministers of the gospel are called to the same accountability: their households, their grief, their marriages, their conduct all speak about the God they serve. The pastor\'s life is a sermon.'),
            ],
            'netbible': [
                ('21:4', 'NET Note: "He must not make himself unclean for people related to him by marriage, and so defile himself" — this awkward phrase is variously interpreted. Most likely: the priest may not mourn in-laws (the "bĕ-ammāyw" — \'among his people\' referring to his wife\'s family). The restriction keeps mourning-impurity strictly within his birth family.'),
            ],
        },
        {
            'header': 'Verses 16–24 — Physical Disqualifications for Priestly Service',
            'verses': verse_range(16, 24),
            'heb': [
                ('mûm', 'mum', 'defect / blemish / imperfection', 'Any physical condition that is less than complete wholeness. The same term used for the sacrificial animals (Lev 1:3, "without defect"). The priest who offers must be as whole as the animal he offers — the principle of correspondence between offerer and offering.'),
            ],
            'ctx': 'The list of disqualifying conditions for priestly service (vv.18–20) is extensive: blindness, lameness, disfigured face, limb too short or too long, broken foot or hand, hunchback, dwarf, eye defect, festering sore, scabs, crushed testicles. These physical conditions do not exclude the person from the covenant community or from eating the sacred portions (v.22) — only from officiating at the altar. The logic: the priest who presents offerings before God must embody the wholeness (tāmîm) required of the offerings themselves. The correspondence principle: complete offering, complete offerer.',
            'cross': [
                ('2 Cor 4:7', '"But we have this treasure in jars of clay to show that this all-surpassing power is from God and not from us." Paul\'s contrast — the treasure in clay jars — reflects the priestly ideal: the visible vessel must be worthy of the content it carries. The NT inverts this: God deliberately chooses weakness as the vessel (1 Cor 1:27).'),
                ('Heb 4:15', '"We do not have a high priest who is unable to empathise with our weaknesses, but we have one who has been tempted in every way, just as we are — yet he did not sin." Christ, the eternal high priest, has no physical blemish AND perfectly embodies the moral wholeness the priestly law required.'),
            ],
            'mac': [
                ('21:16–24', 'MacArthur: The physical disqualification list is often misunderstood as discriminatory. Its logic is theological, not social: the priest approaching the altar represents the wholeness of the covenant community before God. Physical completeness (tāmîm) in both sacrifice and priest signals the wholeness of the offering being made. The NT fulfilment: Christ, the sinless and physically perfect high priest, offers himself without blemish.'),
                ('21:22–23', 'MacArthur: The physically disqualified priest retains full covenant status — he may eat the holy portions (v.22) and is not excluded from the priestly community. The restriction is functional, not ontological. He is still a priest; he simply cannot officiate at the altar. The disability affects office, not identity.'),
            ],
            'milgrom': [
                ('21:17–23', 'Milgrom: The disqualification of physically imperfect priests reflects the purity system\'s consistent logic: wholeness (tāmîm) is the hallmark of holiness. Damaged animals cannot be offered; priests with physical blemishes cannot offer. The principle is completeness — nothing partial or diminished can stand before the divine holiness in a representative capacity.'),
            ],
            'sarna': [
                ('21:22', 'Sarna: "He may eat the most holy food of his God, as well as the holy food" — the disqualified priest retains full access to the priestly portions. His exclusion from altar service does not diminish his covenant identity or his share in the sacred provisions. The law is about functional fitness for a specific role, not about human worth.'),
            ],
            'alter': [
                ('21:18–20', 'Alter: The list of physical disqualifications is the most anatomically detailed in Leviticus — a catalogue of human physical imperfection. Its very specificity is part of its logic: wholeness is not vague but particular. Each item named represents a departure from the completeness that the altar demands. The priestly ideal is a complete human body, wholly devoted, wholly intact, wholly offered.'),
            ],
            'calvin': [
                ('21:16–24', 'Calvin: The disqualification of physically imperfect priests from altar service is a shadow of the requirement for moral perfection. No human priest meets the standard completely — they all offer with "blemishes" of sin and weakness. Christ alone fulfils the priestly ideal: without blemish of sin, he offers the perfect sacrifice. His high priesthood is the reality these shadows obscured.'),
            ],
            'netbible': [
                ('21:23', 'NET Note: The disqualified priest "shall not come near the veil or approach the altar, because he has a defect" — his exclusion is spatial, not social. He stands at the threshold of the altar but cannot approach it. He participates in the priestly community fully (eating the holy food) but cannot perform the representative act of approach before God.'),
            ],
        },
    ],
})

lev(22, {
    'title': 'The Holiness of the Offerings: Guard What Is Holy',
    'sections': [
        {
            'header': 'Verses 1–16 — Who May Eat the Sacred Portions',
            'verses': verse_range(1, 16),
            'heb': [
                ('yinnāzĕrû', 'yinnazeru', 'they shall keep away / separate themselves', 'Hiphil of nāzar — to separate, to dedicate. The same root as Nazirite. The priests must "nazarite themselves" from the holy things when they are impure — the requirement of ritual purity as the condition for access to the sacred portions.'),
                ('zār', 'zar', 'outsider / unauthorised person', 'Anyone who is not a priest or a member of a priest\'s household. Access to the sacred portions is restricted; consumption by an outsider incurs guilt and requires restitution. The holy food carries holiness-charge; unauthorized consumption defiles both the person and the sanctuary.'),
            ],
            'ctx': 'Leviticus 22 governs access to the sacred portions of the offerings — who may eat them and under what conditions. The principle is straightforward: the holy food must be consumed in a state of purity by those authorised to receive it. An impure priest must wait; a foreigner, hired servant, or even a divorced daughter returned to her father\'s house cannot eat the priestly portions. However, a priest\'s slave (v.11) and a priest\'s daughter who has not married (vv.12–13) may eat. The regulations define the boundaries of the "priestly household" as the domain within which the sacred portions circulate.',
            'cross': [
                ('1 Cor 11:27–29', '"Whoever eats the bread or drinks the cup of the Lord in an unworthy manner will be guilty of sinning against the body and blood of the Lord… Anyone who eats and drinks without discerning the body of Christ eats and drinks judgment on themselves." Paul applies the Levitical sacred-portions logic to the Lord\'s Supper.'),
                ('Matt 7:6', '"Do not give dogs what is sacred; do not throw your pearls to pigs." Jesus\'s saying uses the Levitical logic of holy things requiring proper recipients.'),
            ],
            'mac': [
                ('22:3–9', 'MacArthur: The priest who approaches the sacred portions in a state of impurity "shall be cut off from my presence" (v.3). The kārēt penalty for casual treatment of holy food signals that the sacred portions are not merely priestly food but extensions of the divine presence. To eat them unworthily is to treat God himself with contempt.'),
                ('22:14–16', 'MacArthur: The provision for accidental consumption of sacred food by an outsider — restitution of the value plus 20% — applies the guilt-offering logic of Lev 5:14–16 to the sacred portions. Even unintentional violation of the holy requires restitution. The law makes holiness concrete: it has measurable value that must be compensated when violated.'),
            ],
            'milgrom': [
                ('22:3', 'Milgrom: The kārēt penalty for an impure priest approaching the sacred portions is the divine enforcement mechanism for priestly purity. Where human courts cannot enforce — since impurity is often invisible — God himself enforces. The holy things are self-protecting: they punish those who approach them without the proper status.'),
                ('22:10–13', 'Milgrom: The definition of the priestly household (priest, wife, children, slaves, but not hired servant or resident alien) is more inclusive than the ethnic priestly line but more exclusive than the general community. The sacred portions circulate within a defined circle of priestly dependents — those whose welfare is bound to the priest\'s own.'),
            ],
            'sarna': [
                ('22:14', 'Sarna: The 20% surcharge for accidental consumption of sacred food by an outsider parallels the guilt-offering provision of Lev 5:16. The consistency of the 20% penalty across different contexts (sacred property, sacred food) reflects the Torah\'s systematic coherence: violations of the holy consistently incur a one-fifth supplement as acknowledgment of the sacred\'s premium value.'),
            ],
            'alter': [
                ('22:1–3', 'Alter: The chapter opens with the divine address to "Aaron and his sons" — the second-generation priestly establishment, no longer Moses alone. The instruction has now been fully institutionalised: the priests are its ongoing custodians, not merely its first recipients. The Levitical system is designed for perpetuation, not just for the wilderness generation.'),
            ],
            'calvin': [
                ('22:1–16', 'Calvin: The sacred portions\' access restrictions teach the principle of worthy reception — coming to the holy in appropriate condition. The Christian application is not to restrict the Lord\'s Table arbitrarily but to come with genuine self-examination (1 Cor 11:28): not with the body but with the heart in a state of purity before God.'),
            ],
            'netbible': [
                ('22:9', 'NET Note: "They must keep my requirements so that they do not become guilty and die because they profane them" — the priestly responsibility is not merely personal but custodial. Priests are guardians of the sacred order; their laxity contaminates both themselves and the system they maintain. Priestly failures are institutionally dangerous.'),
            ],
        },
        {
            'header': 'Verses 17–33 — Acceptable and Unacceptable Offerings',
            'verses': verse_range(17, 33),
            'heb': [
                ('lirṣōnkem', 'lirtsonchem', 'for your acceptance / to be accepted on your behalf', 'The offering must be without defect "for acceptance" — the divine verdict of reception is the goal. An offering presented with a defect is not accepted; the worshipper has wasted their approach. The without-defect requirement protects both the worshipper\'s access and the integrity of the system.'),
                ('ûqiddaštěm', 'uqidashtem', 'you shall consecrate / you shall keep holy', 'The closing command of Lev 22:32 — "you shall consecrate my name." The entire offering system exists to hallow the divine name. Every perfect offering, every kept requirement, is an act of sanctifying God before the congregation.'),
            ],
            'ctx': 'The second half of Lev 22 addresses the quality of offerings — the same without-defect requirement as Lev 1:3 but now spelled out in explicit exclusions: blind, injured, maimed, infected, scabbed, diseased animals (v.22); crushed, bruised, torn, or cut animals (v.24). The reason is consistent: a blemished offering fails to honour the God it is presented to. The chapter closes (vv.31–33) with the Holiness Summary in its most comprehensive form: "Keep my commands and follow them. I am the Lord. Do not profane my holy name, for I must be acknowledged as holy by the Israelites. I am the Lord, who made you holy and who brought you out of Egypt to be your God."',
            'cross': [
                ('Mal 1:8', '"When you bring blind animals for sacrifice, is that not wrong? When you sacrifice lame or diseased animals, is that not wrong?… Try offering them to your governor! Would he be pleased with you?" Malachi quotes Lev 22:20–22 against the post-exilic priests who presented blemished offerings.'),
                ('1 Pet 1:19', '"With the precious blood of Christ, a lamb without blemish or defect." Peter applies the Lev 22 offering requirement directly to the atonement — Christ is the ʿōlāh without mûm.'),
            ],
            'mac': [
                ('22:17–25', 'MacArthur: The detailed list of unacceptable animals reflects the principle of correspondence: what is offered to God must be the best available, not the culled or the inferior. The worshipper who brings a lame or diseased animal is not saving money on a sacrifice — they are insulting the God they claim to worship. Malachi\'s stinging indictment (1:6–14) is grounded in exactly these verses.'),
                ('22:31–33', 'MacArthur: The closing summary of the Holiness Code — "I am the Lord who made you holy and who brought you out of Egypt to be your God" — unites sanctification and redemption. God\'s holiness-making and God\'s redemptive act are one: the same God who freed Israel from Egypt is the one who consecrates them. Holiness is not separate from salvation; it is its fruit.'),
            ],
            'milgrom': [
                ('22:32', 'Milgrom: "Do not profane my holy name, for I must be acknowledged as holy by the Israelites" — the concept of ḥillûl haShem (profaning God\'s name) and qiddûš haShem (sanctifying God\'s name) are introduced here. Israel\'s obedience or disobedience directly affects the reputation of God among the nations. Covenant ethics is not only about Israel\'s welfare but about God\'s glory in the world.'),
            ],
            'sarna': [
                ('22:26–28', 'Sarna: The prohibition on slaughtering a cow or sheep and its young on the same day (v.28) reflects the same humane concern as the prohibition on boiling a kid in its mother\'s milk (Exod 23:19). The Torah\'s care for animal welfare is not sentimental but theological: creation belongs to God; the lives of animals have dignity before him.'),
            ],
            'alter': [
                ('22:32', 'Alter: "I am the Lord who makes you holy" — the Qal participle měqaddēškem, "the one who makes you holy." The divine name is attached to the act of sanctification itself. God does not merely command holiness; he is its agent. Israel cannot make themselves holy; they can only receive and embody the holiness God continuously imparts.'),
            ],
            'calvin': [
                ('22:31–33', 'Calvin: The chapter\'s closing summary is the Holiness Code\'s crowning statement: obedience is both the response to redemption ("I brought you out of Egypt") and the expression of consecration ("I am the Lord who makes you holy"). The Christian life is identical in structure: the cross is the motive, holiness is the fruit, and the sanctifying Spirit is the agent.'),
            ],
            'netbible': [
                ('22:32', 'NET Note: "I must be acknowledged as holy" — the Niphal of qādaš, literally "I will be hallowed/sanctified." God\'s holiness is not diminished by Israel\'s failures, but it is dishonoured before the watching nations. The concept of ḥillûl haShem (name-profaning) becomes central in Ezekiel\'s theology of exile (Ezek 36:20–23): Israel\'s unfaithfulness caused God\'s name to be profaned among the nations.'),
            ],
        },
    ],
})

print("LEV-5 complete: Leviticus 18–22 built.")

# ─────────────────────────────────────────────────────────────────────────────
# LEV-6: Chapters 23–27 — Feasts, Jubilee, Vows, and Tithes
# ─────────────────────────────────────────────────────────────────────────────

lev(23, {
    'title': 'The Sacred Calendar: The Feasts of the Lord',
    'sections': [
        {
            'header': 'Verses 1–22 — The Weekly Sabbath and Spring Feasts',
            'verses': verse_range(1, 22),
            'heb': [
                ('môʿădê yhwh', "mo'adei YHWH", 'appointed times of the Lord / sacred assemblies', 'From yāʿad, to meet by appointment. The feasts are not Israel\'s festivals but God\'s — times he has set to meet with his people. The calendar is theo-centric: the rhythm of Israel\'s year is ordered by divine appointment, not agricultural convenience or royal decree.'),
                ('šabbātôn', 'shabbaton', 'sabbath rest / complete rest', 'An intensive form of šabbāt — a complete, total cessation. Applied to the weekly Sabbath and to the great annual sabbaths (Passover, Day of Atonement). The word signals that these are not merely days off but covenantal rest — participation in God\'s own rest.'),
            ],
            'ctx': 'Leviticus 23 gives the complete sacred calendar: (1) the weekly Sabbath (v.3); (2) Passover and Unleavened Bread (vv.4–8, 14 Nisan); (3) Firstfruits/Omer (vv.9–14, first Sunday after Passover); (4) Weeks/Pentecost/Shavuot (vv.15–21, 50 days after Firstfruits). The spring feasts are a theological narrative: Passover = redemption from Egypt; Unleavened Bread = separation from corruption; Firstfruits = resurrection and new life; Weeks = the Spirit\'s harvest. Paul reads them as a typological sequence that Christ fulfils: "Christ, our Passover lamb, has been sacrificed" (1 Cor 5:7); "Christ, the firstfruits" (1 Cor 15:20); Pentecost as the Spirit\'s outpouring (Acts 2).',
            'cross': [
                ('1 Cor 5:7–8', '"For Christ, our Passover lamb, has been sacrificed. Therefore let us keep the Festival, not with the old bread leavened with malice and wickedness, but with the unleavened bread of sincerity and truth."'),
                ('1 Cor 15:20', '"But Christ has indeed been raised from the dead, the firstfruits of those who have fallen asleep." The Firstfruits feast (v.10) is fulfilled in the resurrection.'),
                ('Acts 2:1–4', '"When the day of Pentecost came… all of them were filled with the Holy Spirit." Pentecost — the Feast of Weeks — is the appointed time when God pours out his Spirit.'),
            ],
            'mac': [
                ('23:1–3', 'MacArthur: The weekly Sabbath heads the entire sacred calendar — before any annual feast is named, the Sabbath is established as the foundational sacred time. All other appointed times are extensions of the Sabbath principle: regular, covenantal cessation from labour as an act of trust in the God who provides.'),
                ('23:10–14', 'MacArthur: The Firstfruits offering (the first sheaf of the grain harvest) could not be eaten until it was presented before the Lord — no bread, roasted grain, or new wine until the firstfruits were waved. The principle is prior dedication: God receives the first before Israel eats. This is the agricultural expression of the principle Christ enacts in resurrection: he rises first, then we follow (1 Cor 15:23).'),
            ],
            'milgrom': [
                ('23:4–8', 'Milgrom: The Passover-Unleavened Bread complex (14–21 Nisan) is the foundational historical feast — it commemorates the Exodus event. Milgrom notes that Passover is a home ritual (not a sanctuary sacrifice) while Unleavened Bread involves sanctuary service (vv.7–8). The combination creates a liturgical week that moves from household to communal worship.'),
                ('23:15–21', 'Milgrom: The counting of the Omer (50 days from Firstfruits to Weeks) creates a liturgical arc between the grain harvest\'s beginning and its completion. The number 50 (from ḥǎmiššîm, fifty) gives Pentecost its Greek name. The feast is both agricultural (completion of harvest) and historical — later tradition associates it with the Sinai covenant.'),
            ],
            'sarna': [
                ('23:3', 'Sarna: The Sabbath\'s placement at the head of the sacred calendar (before Passover, before any annual feast) signals its priority. The feasts commemorate historical events; the Sabbath commemorates creation. The annual rhythm is grounded in the weekly rhythm; the historical is grounded in the creational.'),
            ],
            'alter': [
                ('23:10', 'Alter: "When you enter the land I am going to give you and you reap its harvest, bring to the priest a sheaf of the first grain you harvest." The feast legislation is future-oriented — pointing Israel toward a land they have not yet entered. The sacred calendar is given in the wilderness for a settled agricultural life. The liturgy anticipates the promise.'),
            ],
            'calvin': [
                ('23:4–22', 'Calvin: The spring feasts form a typological sequence whose fulfilment Calvin sees in Christ: Passover = Christ\'s death; Unleavened Bread = the purged life of the redeemed; Firstfruits = Christ\'s resurrection; Weeks = the gift of the Spirit. The feasts are not abolished but fulfilled — their substance has come in Christ; their shadow remains as a reminder of what has been accomplished.'),
            ],
            'netbible': [
                ('23:11', 'NET Note: "The day after the Sabbath" for the Firstfruits wave offering (v.11) is debated between Pharisaic interpretation (the day after the first annual sabbath of Unleavened Bread, i.e. 16 Nisan) and Sadducean/Karaite interpretation (the day after the weekly Sabbath during Unleavened Bread, i.e. a Sunday). The debate has implications for the calculation of Pentecost.'),
            ],
        },
        {
            'header': 'Verses 23–44 — The Autumn Feasts: Trumpets, Atonement, Tabernacles',
            'verses': verse_range(23, 44),
            'heb': [
                ('sukkōt', 'sukkot', 'booths / tabernacles / shelters', 'Temporary structures made of branches in which Israel dwells for seven days (vv.42–43) — a reenactment of the wilderness journey. The feast celebrates both the harvest\'s completion and the wilderness period when God provided for Israel in portable shelters.'),
                ('yôm tĕrûʿāh', 'yom teruah', 'day of trumpet blowing / day of alarm', 'The Feast of Trumpets (Rosh Hashanah) on 1 Tishri — the blast of the šôpār (ram\'s horn) that inaugurates the autumn season and calls Israel to assembly. The trumpet-call is both announcement and summons.'),
            ],
            'ctx': 'The autumn feasts complete the sacred year: Trumpets (1 Tishri, vv.24–25) — the šôpār blast inaugurating the month; Day of Atonement (10 Tishri, vv.26–32) — the great fast and sanctuary purging of Lev 16; Tabernacles (15–21 Tishri, vv.33–43) — a seven-day harvest festival in booths, followed by a solemn assembly (šĕmînî ʿaṣeret, "eighth-day assembly," v.36). The autumn feasts follow the same theological logic as the spring: Trumpets = eschatological summons; Atonement = final judgement/cleansing; Tabernacles = eschatological feast in God\'s presence. Revelation\'s imagery of trumpets, judgement, and the great harvest draws extensively on this autumn feast sequence.',
            'cross': [
                ('Rev 8:2', '"And I saw the seven angels who stand before God, and seven trumpets were given to them." The seven trumpet-blasts of Revelation draw on the Yom Teruah trumpet-theology.'),
                ('Zech 14:16–19', '"Then the survivors from all the nations that have attacked Jerusalem will go up year after year to worship the King, the Lord Almighty, and to celebrate the Festival of Tabernacles." Tabernacles is the eschatological feast — the nations join Israel in celebrating God\'s harvest.'),
                ('John 7:37–38', '"On the last and greatest day of the festival, Jesus stood and said in a loud voice, \'Let anyone who is thirsty come to me and drink.\'" Jesus\'s water-of-life declaration on the last day of Tabernacles claims to fulfil the feast\'s deepest longing.'),
            ],
            'mac': [
                ('23:33–36', 'MacArthur: Tabernacles is the most joyful feast in the Levitical calendar — a seven-day harvest celebration in temporary shelters, followed by the šĕmînî ʿaṣeret (eighth-day assembly). The eighth day again signals new beginning: beyond the completion of the harvest week, into the eschatological rest. The booth-dwelling reenacts the wilderness journey — God dwelt with Israel in temporary structures; they dwell in temporary structures in gratitude.'),
                ('23:26–32', 'MacArthur: The Day of Atonement (Yom Kippur) appears in the feast calendar between Trumpets and Tabernacles. The sequence is intentional: the šôpār call (Trumpets) summons Israel to account; Atonement provides the purging; Tabernacles celebrates the restored fellowship. The eschatological reading: the trumpet announces judgement, atonement provides the solution, the feast follows.'),
            ],
            'milgrom': [
                ('23:39–43', 'Milgrom: The booth-dwelling commandment (vv.42–43) is given a dual rationale: (1) harvest celebration (the booths are built from harvest vegetation); (2) memorial of the wilderness journey ("so your descendants will know that I made the Israelites live in temporary shelters"). The feast holds together present gratitude and historical memory.'),
            ],
            'sarna': [
                ('23:40', 'Sarna: "The fruit of majestic trees, branches of palm trees, boughs of leafy trees, and willows of the brook" — the four species of Sukkot (later codified as etrog, lulav, hadassim, aravot). The lush vegetation waved before God is a celebration of the harvest\'s abundance — a joyful acknowledgment that the land and its fruit belong to the God who gave them.'),
            ],
            'alter': [
                ('23:42–43', 'Alter: "Live in temporary shelters for seven days… so your descendants will know that I had the Israelites live in temporary shelters when I brought them out of Egypt." The feast\'s embodied dimension — actually dwelling in booths — is pedagogical. The body is the classroom; the physical experience of temporary shelter teaches the theology of wilderness dependence and divine provision.'),
            ],
            'calvin': [
                ('23:33–43', 'Calvin: Tabernacles points to the eternal feast — the great gathering of all God\'s people at the end of the age, dwelling in God\'s presence not temporarily but forever. The booth is the symbol of our present condition: pilgrims in temporary dwellings, awaiting the permanent city whose builder and maker is God (Heb 11:10). The feast calls Israel — and us — to hold the present lightly and the future firmly.'),
            ],
            'netbible': [
                ('23:36', 'NET Note: "On the eighth day hold a sacred assembly and present a food offering to the Lord. It is the closing special assembly; do no regular work" — the šĕmînî ʿaṣeret ("eighth-day restraint") is a separate feast appended to Tabernacles. Rabbinic tradition treats it as a distinct holiday (eventually becoming Simchat Torah in diaspora Judaism). Its significance: the number eight signals new creation beyond the seven-day week.'),
            ],
        },
    ],
})

lev(24, {
    'title': 'The Lampstand, the Bread, and the Blasphemer',
    'sections': [
        {
            'header': 'Verses 1–9 — The Lampstand and the Bread of the Presence',
            'verses': verse_range(1, 9),
            'heb': [
                ('lĕhaʿălōt nēr tāmîd', "leha'alot ner tamid", 'to keep the lamps burning continually', 'The perpetual lamp — tāmîd (continuous/perpetual) is the same word as the perpetual altar fire (Lev 6:13). The lampstand burns continuously as the altar burns continuously: both are signs of uninterrupted divine presence and permanent priestly attention.'),
                ('leḥem happānîm', 'lechem hapanim', 'bread of the presence / showbread / bread of the face', 'Twelve loaves representing the twelve tribes, set before the Lord permanently on the gold table in the holy place. "Bread of the face" — placed before God\'s face, renewed each Sabbath, eaten by the priests in the holy place. A perpetual covenant meal.'),
            ],
            'ctx': 'Leviticus 24 begins with two standing orders for the sanctuary\'s interior: the lampstand (vv.1–4) and the bread of the presence (vv.5–9). Both are tāmîd — perpetual. The lampstand of pure gold burns through every night; the twelve loaves are replaced each Sabbath, the old ones eaten by the priests. Together they represent the two aspects of uninterrupted covenant: God\'s light (presence/guidance) and Israel\'s sustenance (his provision). The lampstand is kept burning by Israel\'s olive oil; the bread is renewed weekly. Human faithfulness maintains the signs of divine presence.',
            'cross': [
                ('John 8:12', '"I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life." Jesus declares himself the fulfilment of the perpetual lampstand — the eternal, never-extinguished light.'),
                ('John 6:35', '"I am the bread of life." Jesus is the antetype of the bread of the presence — the true bread placed before God on behalf of all humanity.'),
                ('Rev 1:20', '"The mystery of the seven stars that you saw in my right hand and of the seven golden lampstands is this: The seven stars are the angels of the seven churches, and the seven lampstands are the seven churches." The church inherits the lampstand imagery — a perpetual light in the darkness.'),
            ],
            'mac': [
                ('24:1–4', 'MacArthur: The lampstand burning through every night from evening to morning — maintained by Aaron and his sons — is the priestly task that most directly mirrors the divine activity. God is the light of the world; the priests maintain the representation of that light in the sanctuary. The oil burned is olive oil — the best, the purest — pressed to give light, not kept for eating.'),
                ('24:5–9', 'MacArthur: The twelve loaves represent the twelve tribes before God permanently — Israel is always present at the divine table. The weekly replacement on the Sabbath means that each week Israel\'s covenant presence is renewed before God. The priests eat the old loaves in the holy place — they eat at God\'s table, sustained by what was presented to him. The priestly meal is a form of fellowship with God.'),
            ],
            'milgrom': [
                ('24:2–4', 'Milgrom: The perpetual lamp (nēr tāmîd) parallels the perpetual fire (ʾēš tāmîd, Lev 6:13) and the perpetual bread (leḥem tāmîd, Num 4:7). The tāmîd principle — uninterrupted continuity — is central to the sanctuary\'s theology. The divine presence is never dormant, never inattentive; the sanctuary\'s lights and breads signal that God\'s engagement with Israel is permanent.'),
                ('24:8', 'Milgrom: The weekly bread renewal "on behalf of the Israelites as a lasting covenant" (v.8) frames the bread of presence as a covenant sign. The twelve loaves are not food for God (he does not eat) but a permanent covenant token — Israel\'s twelve tribes perpetually before God\'s face, acknowledged by him, belonging to him.'),
            ],
            'sarna': [
                ('24:5–7', 'Sarna: The twelve loaves in two rows of six, with frankincense on each row, placed on the gold table — the spatial arrangement is precise and significant. Twelve = the full number of the tribes; two rows = perhaps the two tablets of the covenant or the two kingdoms. The frankincense burned as the ʾazkārāh (memorial portion) makes the bread-presentation a weekly act of covenant remembrance.'),
            ],
            'alter': [
                ('24:8–9', 'Alter: "This bread is to be set out before the Lord regularly, Sabbath after Sabbath, on behalf of the Israelites, as a lasting covenant. It belongs to Aaron and his sons, who are to eat it in the sanctuary area." The bread moves from the divine table to the priestly table — from the presence of God to the mouths of his servants. The cycle of covenant provision is complete.'),
            ],
            'calvin': [
                ('24:1–9', 'Calvin: The perpetual lamp and the bread of presence teach that the covenant relationship requires ongoing maintenance — it is not a once-for-all transaction but a living relationship that must be tended. Oil must be pressed and supplied; loaves must be baked and renewed. The NT equivalent: "Do not let the fire go out" (1 Thess 5:19); "pray without ceasing" (1 Thess 5:17). The perpetual disciplines sustain the perpetual presence.'),
            ],
            'netbible': [
                ('24:5', 'NET Note: "Take the finest flour and bake twelve loaves of bread" — the twelve loaves are baked from sōlet, the finest wheat flour (the same as the grain offering, Lev 2:1). Only the best sustains the covenant token. The requirement for fine flour elevates the bread from ordinary food to sacred symbol — the highest-quality product of Israel\'s agricultural work placed before God.'),
            ],
        },
        {
            'header': 'Verses 10–23 — The Blasphemer: Law of Talion Applied',
            'verses': verse_range(10, 23),
            'heb': [
                ('wayyiqqōb wayyĕqallēl', 'wayyiqqov wayyeqallel', 'he blasphemed and cursed', 'Two verbs: nāqab (to pierce/specify — naming the divine name explicitly in a curse) and qālal (to make light, to curse). The combination signals the gravest verbal offence: using the sacred name as the instrument of a curse.'),
                ('ʿayin taḥat ʿayin', 'ayin tachat ayin', 'eye for eye', 'The lex talionis — the law of proportional retaliation. It is not a mandate for revenge but a limit on it: the punishment must not exceed the offence. The same measure applies to native and foreigner alike (v.22) — equal justice regardless of origin.'),
            ],
            'ctx': 'The narrative break in Lev 24 is jarring — from the ordered sanctuary regulations to a specific incident: the son of an Israelite mother and Egyptian father blasphemes during a fight, is put in custody, and God pronounces the death penalty by stoning. The incident (vv.10–16, 23) frames the lex talionis (vv.17–22): life for life, eye for eye, tooth for tooth, fracture for fracture. The same law applies to native and foreigner — equal justice is the covenant\'s requirement. The blasphemer is executed outside the camp; the entire community participates in the stoning.',
            'cross': [
                ('Matt 5:38–39', '"You have heard that it was said, \'An eye for an eye and a tooth for a tooth.\' But I tell you, do not resist an evil person." Jesus does not abolish the lex talionis but exceeds it: the new covenant standard is not equal retaliation but gracious non-retaliation.'),
                ('Lev 19:18', 'The lex talionis (equal retaliation) and the love command (Lev 19:18) exist in tension that the NT resolves: the justice principle is satisfied by Christ (bearing the full penalty); those in Christ are freed to absorb injustice rather than perpetuate it.'),
            ],
            'mac': [
                ('24:10–16', 'MacArthur: The blasphemer\'s case is a narrative illustration of the principle that the divine name is not to be used lightly (Exod 20:7). The man who uses God\'s name as a curse-instrument — weaponising the sacred — forfeits his life. The penalty is not disproportionate; it is proportional to the offence: the name that creates the world (Gen 1) cannot be deployed for its destruction without consequence.'),
                ('24:17–22', 'MacArthur: The lex talionis is not barbaric but civilising — it limits punishment to the measure of the offence, preventing cycles of escalating revenge. In the ancient world, bloodfeuds typically multiplied: one injury leading to ten in retaliation. The \'eye for eye\' principle caps the cycle: no more than was taken may be taken. The same standard applies to the foreigner (v.22) — equal justice is a universal covenant obligation.'),
            ],
            'milgrom': [
                ('24:10–16', 'Milgrom: The placement of the blasphemy narrative between the sanctuary regulations and the Holiness Code summary is intentional. Blasphemy — profaning the divine name — is the verbal equivalent of what the sexual and cultic violations of Lev 18–22 enact behaviourally. The name and the sanctuary are both expressions of the divine presence; both must be protected from profanation.'),
                ('24:22', 'Milgrom: "You are to have the same law for the foreigner and the native-born" — the equal justice principle is one of Leviticus\'s most radical statements. In the ancient Near East, legal systems routinely differentiated penalties by social status and ethnic origin. Leviticus insists on uniform application: the same law for all who live within the covenant community.'),
            ],
            'sarna': [
                ('24:17–21', 'Sarna: The lex talionis sequence (life, eye, tooth, hand, foot, bruise) is not a license for private vengeance but a judicial standard. The punishment must be administered by the community (vv.14, 16, 23 — the whole assembly stoning the offender), not by the victim or their family. The law is court-administered, not self-administered.'),
            ],
            'alter': [
                ('24:10', 'Alter: The blasphemer is identified as "the son of an Israelite woman and an Egyptian father" — a detail that establishes him as a person of mixed origin, liminally positioned between Israel and Egypt. His offence occurs in the context of a fight (bĕtôk — in the midst of), suggesting social tension. The narrative is a test case for how the covenant community handles dangerous speech at its social margins.'),
            ],
            'calvin': [
                ('24:17–22', 'Calvin: The lex talionis teaches the fundamental equality of all persons before the law — the same penalty applies regardless of status or origin. This principle, extended by Christ, becomes the foundation of Christian ethics: every human being bears the image of God and deserves equal dignity and equal justice. The NT deepens this: not merely equal retaliation but equal love (Matt 5:44–45).'),
            ],
            'netbible': [
                ('24:16', 'NET Note: "Anyone who blasphemes the name of the Lord is to be put to death. The entire assembly must stone them." The community\'s collective participation in the execution is deliberate — blasphemy is an offence against the whole covenant community, not merely against the individual God. The community that tolerates blasphemy shares its guilt (cf. Lev 20:4–5).'),
            ],
        },
    ],
})

lev(25, {
    'title': 'The Sabbath Year and Jubilee: Creation\'s Rest and Freedom',
    'sections': [
        {
            'header': 'Verses 1–28 — The Sabbath Year and the Year of Jubilee',
            'verses': verse_range(1, 28),
            'heb': [
                ('šĕmîṭṭāh', 'shemittah', 'release / Sabbath year', 'Every seventh year the land rests — no sowing, pruning, or harvest. What grows of itself may be eaten by all (owners, servants, foreigners, animals). The land is released from agricultural service; Israel is reminded that the land belongs to God, not to them.'),
                ('yôbēl', 'yovel', 'Jubilee / ram\'s horn', 'The fiftieth year — the year following seven sabbath-years. The šôpār (ram\'s horn) is blown on Yom Kippur of the 49th year, announcing the Jubilee. Land returns to original family; Hebrew slaves are freed; debts are restructured. Yôbēl may derive from the ram\'s horn or from the concept of "bringing back."'),
            ],
            'ctx': 'Leviticus 25 is the Torah\'s most radical economic legislation. The sabbath year (every seventh) rests the land and releases agricultural debts; the Jubilee (every fiftieth, announced on Yom Kippur of the 49th year) does three things: (1) releases all Hebrew slaves (vv.39–55); (2) returns all land to its ancestral family (vv.13–28); (3) cannot therefore involve permanent land sales — only the use of the land until the next Jubilee can be sold. The theological ground (v.23): "The land must not be sold permanently, because the land is mine and you reside in my land as foreigners and strangers." God owns the land; Israel are his tenants. The Jubilee enacts this truth economically.',
            'cross': [
                ('Luke 4:18–21', '"The Spirit of the Lord is on me, because he has anointed me to proclaim good news to the poor. He has sent me to proclaim freedom for the prisoners… to proclaim the year of the Lord\'s favour." Jesus opens his ministry by reading Isa 61:1–2, which is itself a Jubilee text. He declares himself the fulfilment of the Jubilee.'),
                ('Isa 61:1–2', '"To proclaim the year of the Lord\'s favour" — the Jubilee language applied to the eschatological age of redemption. The Jubilee becomes a messianic metaphor: the ultimate release, return, and restoration.'),
                ('Rom 8:21', '"That the creation itself will be liberated from its bondage to decay." The Jubilee\'s land-release is the type of the eschatological liberation of the whole creation from its bondage.'),
            ],
            'mac': [
                ('25:8–17', 'MacArthur: The Jubilee is announced on Yom Kippur — the Day of Atonement — of the 49th year. The connection is deliberate: the great release follows the great atonement. Only a community that has been atoned for can live in the freedom the Jubilee prescribes. The economic restructuring presupposes the spiritual restoration. The NT order is identical: atonement in Christ is the basis for the new community\'s economic ethics.'),
                ('25:23', 'MacArthur: "The land must not be sold permanently, because the land is mine and you reside in my land as foreigners and strangers." This verse is the theological foundation of the entire chapter. Permanent accumulation of land is impossible when you acknowledge that you are a tenant, not an owner. The Jubilee is the institutional expression of this theology.'),
            ],
            'milgrom': [
                ('25:10', 'Milgrom: "Proclaim liberty throughout the land to all its inhabitants" (ûqĕrātem dĕrôr bāʾāreṣ) — this verse is inscribed on the Liberty Bell in Philadelphia. Dĕrôr is specifically the release of debt-slaves — not a general "freedom" but the specific freedom of those enslaved by economic misfortune. The Jubilee is an anti-poverty programme built into the covenant calendar.'),
                ('25:25–28', 'Milgrom: The land-redemption provisions (vv.25–28) give the Jubilee a built-in redemption mechanism before the 50th year: a family member (gōʾēl, kinsman-redeemer) may buy back land sold in hardship. This creates a graduated safety net: family redemption first, then Jubilee return. The system assumes community responsibility for its economically vulnerable members.'),
            ],
            'sarna': [
                ('25:23', 'Sarna: The theological rationale for the Jubilee — "the land is mine" — places the entire economic system of Israel on a theological foundation. Private property is real but derivative: Israel holds the land as stewards, not as ultimate owners. Every economic transaction takes place within the covenant framework of divine ownership and tenant obligation.'),
            ],
            'alter': [
                ('25:10', 'Alter: "Consecrate the fiftieth year and proclaim liberty throughout the land to all its inhabitants. It shall be a jubilee for you; each of you is to return to your family property and to your own clan." The Jubilee is a great homecoming — not merely economic reset but social restoration. Families separated by poverty are reunited; ancestral lands are returned; the community is reconstituted.'),
            ],
            'calvin': [
                ('25:8–17', 'Calvin: The Jubilee is the clearest OT type of the gospel\'s liberty. The good news of Christ is the announcement of a permanent Jubilee: slaves freed (from sin), land returned (the inheritance of eternal life), debts cancelled (sins forgiven). Every Jubilee in Israel\'s history was a shadow of the one proclamation Jesus makes in Luke 4: the year of the Lord\'s favour has come.'),
            ],
            'netbible': [
                ('25:10', 'NET Note: "Return to your family property and to your own clan" — the Jubilee presupposes a stable ancestral land allocation (the original tribal division of Canaan in Josh 13–19). The economic safety net only functions if the original just distribution is maintained. The Jubilee is not merely redistributive but restorative — it returns to the original just order.'),
            ],
        },
        {
            'header': 'Verses 29–55 — Redemption of Houses, Poverty Provisions, and Slavery',
            'verses': verse_range(29, 55),
            'heb': [
                ('gōʾēl', 'go\'el', 'kinsman-redeemer / redeemer', 'The family member obligated to redeem a relative\'s land, freedom, or honour. The gōʾēl pays the redemption price to restore what was lost. The concept becomes the OT\'s primary metaphor for God\'s own redemptive action: God is Israel\'s gōʾēl (Isa 43:14; 44:6).'),
                ('kî-ʿăbādāy hēm', "ki-avadai hem", 'for they are my servants', 'The ground for the prohibition on permanent Israelite enslavement (v.42, 55): Israel belongs to God — they were redeemed from Egypt to be his servants. An Israelite cannot be permanently enslaved because they are already owned by God. Prior divine ownership prevents human permanent ownership.'),
            ],
            'ctx': 'The second half of Lev 25 applies the Jubilee principles to specific cases: walled-city houses (one-year redemption window, not subject to Jubilee, vv.29–31); Levitical cities (always redeemable and return at Jubilee, vv.32–34); poverty support loans (no interest among brothers, vv.35–38); Israelite debt-slavery (must be treated as a hired worker, released at Jubilee, vv.39–55). The repeated refrain "for they are my servants whom I brought out of Egypt" (vv.42, 55) grounds the entire economic ethics in the Exodus: God\'s redemptive act creates social obligation. Those whom God freed cannot be permanently enslaved by other humans.',
            'cross': [
                ('Rom 6:22', '"But now that you have been set free from sin and have become slaves of God, the benefit you reap leads to holiness, and the result is eternal life." Paul applies the "servants of God" principle to the new covenant: those redeemed by Christ belong to him, not to sin\'s slavery.'),
                ('Gal 5:1', '"It is for freedom that Christ has set us free. Stand firm, then, and do not let yourselves be burdened again by a yoke of slavery." The NT Jubilee: Christ\'s redemption creates permanent freedom; returning to slavery (of any kind) is a covenant contradiction.'),
                ('Ruth 4:4–6', 'Boaz as gōʾēl for Ruth and Naomi — the kinsman-redeemer concept of Lev 25:25 enacted in narrative. Boaz redeems Elimelech\'s land and takes Ruth as wife, restoring the family to its inheritance.'),
            ],
            'mac': [
                ('25:35–38', 'MacArthur: The prohibition on charging interest to a poor Israelite brother is one of the most countercultural economic laws in the ancient world — and in the modern. The logic: when your brother is impoverished, the goal is restoration, not profit. Lending to a poor covenant brother at interest converts his misfortune into your gain — a form of exploitation that violates the "love your neighbour" principle of Lev 19:18.'),
                ('25:39–55', 'MacArthur: The debt-slavery regulations insist that an Israelite enslaved by poverty must be treated "as a hired worker, not as a slave" (v.40). He is to be treated with dignity, released at Jubilee, and his family is to go with him (v.41). The reason given twice: "they are my servants." Divine ownership provides the foundation for human dignity.'),
            ],
            'milgrom': [
                ('25:42', 'Milgrom: "For they are my servants, whom I brought out of Egypt; they must not be sold as slaves." This is the Jubilee\'s theological capstone. The Exodus is the inalienable datum: God owns Israel; no human can claim permanent ownership over what God has redeemed. Permanent enslavement of an Israelite is a theological affront to the Exodus event.'),
                ('25:35–37', 'Milgrom: The no-interest loan requirement (vv.36–37) covers both monetary loans (nešek) and food loans (tarbît/marbît). Both forms of increase from a poor brother\'s loan are prohibited. The distinction is: lending to a commercial partner may include interest; lending to a destitute brother may not. The poverty of the recipient determines the ethical category.'),
            ],
            'sarna': [
                ('25:47–55', 'Sarna: The case of an Israelite sold to a wealthy foreigner (vv.47–55) is the chapter\'s most complex provision. The kinsman-redeemer may buy him back at a graduated price (years of service remaining); if not redeemed, he is freed at Jubilee. Even in the most degraded situation — an Israelite owned by a non-Israelite within the land — the Jubilee guarantee holds. The divine ownership cannot be permanently alienated.'),
            ],
            'alter': [
                ('25:55', 'Alter: "For the Israelites belong to me as servants. They are my servants, whom I brought out of Egypt. I am the Lord your God." The chapter closes with the divine self-identification that grounds everything: I am the Lord. The Exodus is the event; the LORD is the actor; Israel\'s freedom is the consequence. Every economic law in this chapter is a footnote to this theological statement.'),
            ],
            'calvin': [
                ('25:35–55', 'Calvin: The poverty provisions of Lev 25 challenge the church in every generation. The no-interest loan, the Jubilee release, the kinsman-redeemer obligation — these are not merely ancient regulations but expressions of the covenant ethic of solidarity. Those who have been redeemed by God are obligated to act redemptively toward their neighbours. The gospel creates economic ethics.'),
            ],
            'netbible': [
                ('25:36', 'NET Note: "Do not take interest or any profit from them" — nešek (literally "bite," interest on money) and tarbît/marbît (increase, interest on food) are both prohibited. The two terms together cover all forms of profit from loans to the poor. This absolute prohibition on poverty-lending interest is unique in the ancient Near East, where interest rates of 20–33% were common.'),
            ],
        },
    ],
})

lev(26, {
    'title': 'Blessings and Curses: The Covenant\'s Two Paths',
    'sections': [
        {
            'header': 'Verses 1–26 — Covenant Blessings and the First Stages of Curse',
            'verses': verse_range(1, 26),
            'heb': [
                ('bĕrākāh / qĕlālāh', 'berachah / qelalah', 'blessing / curse', 'The two paths of the Deuteronomic covenant structure, present here in their earliest Levitical form. Obedience → blessing (rain, harvest, peace, victory, divine presence); disobedience → curse (terror, disease, drought, defeat, exile). The covenant has real consequences built into its structure.'),
                ('ʿim-bĕḥuqqōtay tēlēkû', 'im-bechukotai telechu', 'if you walk in my statutes', 'The conditional \'if\' frames both paths. The covenant is not unconditional — it is a treaty with stipulations and consequences. Blessings and curses are both real possibilities; which Israel experiences depends on which path they choose.'),
            ],
            'ctx': 'Leviticus 26 is the Holiness Code\'s peroratio — the great covenant speech that seals the entire legislative section (Lev 17–26). Its structure mirrors the ancient Near Eastern suzerainty treaty: introduction (vv.1–2), blessings for obedience (vv.3–13), curses for disobedience in graduated stages (vv.14–39), and a concluding promise of restoration (vv.40–45). The blessings are rich (rain, harvest, peace, defeat of enemies, divine walking among the people); the curses are escalating and specific: terror and wasting disease (vv.14–17), seven-times multiplication (vv.18–20), plague and wild animals (vv.21–22), destruction and famine (vv.23–26). The sevenfold multiplication of punishment signals the covenant\'s gravity.',
            'cross': [
                ('Deut 28', 'The parallel blessing-curse passage in Deuteronomy is more extensive but follows the same structure and language as Lev 26. Both are expressions of the Sinaitic covenant\'s conditional character.'),
                ('Gal 3:13', '"Christ redeemed us from the curse of the law by becoming a curse for us, for it is written: \'Cursed is everyone who is hung on a pole.\'" Paul\'s redemption from the covenant curse (Lev 26\'s qĕlālāh) is through Christ bearing the curse himself.'),
                ('Rev 6:5–8', 'The four horsemen — conquest, war, famine, death — are the covenant curses of Lev 26:23–26 applied eschatologically. The seals of Revelation draw directly on the Levitical curse vocabulary.'),
            ],
            'mac': [
                ('26:3–13', 'MacArthur: The blessings of covenant obedience are comprehensive and material — rain, harvest, peace, victory, population growth, and the supreme blessing: "I will walk among you and be your God, and you will be my people" (v.12). The immanuel promise — God dwelling with his people — is the climax of the blessing list. All material blessings are shadows of this one supreme blessing.'),
                ('26:14–26', 'MacArthur: The escalating curses follow a logic: each stage is worse than the previous; each stage is described as God\'s response to Israel\'s continued stubbornness ("if you remain hostile to me," vv.21, 23, 27). The sevenfold multiplication (vv.18, 21, 24, 28) signals not mathematical precision but covenant totality: the full weight of the violated covenant falls on those who persist in rebellion.'),
            ],
            'milgrom': [
                ('26:3–13', 'Milgrom: The blessing list is dominated by agricultural and military flourishing — rain in season, abundant harvests, peace from enemies. Milgrom notes that these are the very blessings Israel experienced under David and Solomon, and the very losses they experienced in the exile. The covenant blessings and curses have a historical track record that makes Lev 26 retrospectively compelling.'),
                ('26:11–12', 'Milgrom: "I will put my dwelling place among you… I will walk among you and be your God" — the immanuel promise. Milgrom\'s observation: the priestly language of God "walking among" (hithallēk) Israel recalls the garden-walking of Gen 3:8. Lev 26 promises a restoration of Eden — God present with his people without barrier.'),
            ],
            'sarna': [
                ('26:1–2', 'Sarna: The chapter opens with two prohibitions — no idols or sacred stones (v.1), observe the Sabbath and revere the sanctuary (v.2). These are the twin foundations of the covenant: exclusive loyalty to YHWH (no idols) and the covenant\'s temporal-spatial axis (Sabbath and sanctuary). All the blessings and curses that follow presuppose these two foundations.'),
            ],
            'alter': [
                ('26:12', 'Alter: "I will walk among you and be your God, and you will be my people" — this verse is the covenant formula in its most concise and beautiful form. Walking (hithallēk) is an intimacy metaphor: God and Israel moving through life together, companions in the covenant journey. The formula recurs throughout the prophets and reaches its fullest expression in Rev 21:3.'),
            ],
            'calvin': [
                ('26:3–13', 'Calvin: The covenant blessings teach that obedience is not a path to earning God\'s favour but the condition for enjoying it. God has already declared himself Israel\'s God; the blessings are the expression of that relationship when it is honoured. Similarly, the Christian who walks faithfully does not earn grace but enjoys its fruits — peace, fruitfulness, the felt presence of God.'),
            ],
            'netbible': [
                ('26:12', 'NET Note: "I will walk among you" (wĕhithallaktî bĕtôkĕkem) — the Hithpael of hālak, a reflexive/intensive form suggesting active, continuous movement. God does not merely reside among Israel but actively moves among them. The same form appears in Gen 3:8 for God\'s walking in the garden. The covenant promise is a return to Eden-intimacy.'),
            ],
        },
        {
            'header': 'Verses 27–46 — The Final Curses, Exile, and the Promise of Restoration',
            'verses': verse_range(27, 46),
            'heb': [
                ('wĕzākartî ʾet-bĕrîtî yaʿăqôb', 'vezacharti et-beriti Yaakov', 'and I will remember my covenant with Jacob', 'The turning point of the chapter — in the midst of the curse\'s severest stage, God announces that he will remember (zākar) the patriarchal covenant. Divine memory is not passive recollection but active intervention. The covenant cannot be finally broken because God will not forget.'),
                ('šabbĕtāh ʾet-šabbĕtōtêhā', 'shabtetah et-shabbetoteiha', 'she shall enjoy her sabbaths', 'During the exile, the land lies desolate and "makes up" (resting) for the sabbath years Israel failed to observe. The land\'s enforced rest is the covenant\'s ironic fulfilment: what Israel refused to grant voluntarily, God enforces through exile.'),
            ],
            'ctx': 'The most severe curses (vv.27–39) describe the exile in graphic detail: cannibalism in the siege (v.29), destruction of the high places (v.30), devastation of cities (v.31), scattering among the nations (v.33), hearts filled with fear in enemy lands (vv.36–39). Yet the chapter\'s final movement (vv.40–45) is not despair but hope: if Israel confesses their sin and humbles their uncircumcised hearts, God will remember the Abrahamic covenant. The exile is penultimate; the covenant is final. Leviticus ends not with threat but with promise — the same God who curses for covenant breach will restore for covenant repentance.',
            'cross': [
                ('Dan 9:4–19', 'Daniel\'s great prayer of confession explicitly applies Lev 26\'s curse language to the Babylonian exile — "the curses and sworn judgments written in the Law of Moses" (v.11). He pleads for the restoration promised in vv.40–45.'),
                ('Neh 1:5–11', 'Nehemiah\'s prayer also draws on Lev 26:40–45 — confession, return, and the promise that God will gather his scattered people.'),
                ('Rev 21:3–4', '"And I heard a loud voice from the throne saying, \'Look! God\'s dwelling place is now among the people and he will dwell with them.\'" The covenant formula of Lev 26:12 reaches its final fulfilment — God walking among his people permanently, all curses ended forever.'),
            ],
            'mac': [
                ('26:40–45', 'MacArthur: The restoration promise at the chapter\'s close is the most important theological statement in Lev 26. Despite the sevenfold curse, despite exile, despite complete covenant failure — God will remember the Abrahamic covenant. The basis of restoration is not Israel\'s improved performance but God\'s prior unconditional promise to Abraham. The Sinaitic covenant has conditions; the Abrahamic covenant is the bedrock beneath it.'),
                ('26:34–35', 'MacArthur: "The land will rest and enjoy its sabbaths" during the exile — the land receives the sabbath years Israel refused to give it. The Chronicler applies this directly: "The land enjoyed its sabbath rests; all the time of its desolation it rested, until the seventy years were completed" (2 Chr 36:21). The exile is the Sabbath year the land was owed.'),
            ],
            'milgrom': [
                ('26:44–45', 'Milgrom: "Yet in spite of this, when they are in the land of their enemies, I will not reject them or abhor them so as to destroy them completely, breaking my covenant with them. I am the Lord their God." The unconditional preservation promise is the theological apex of the entire Holiness Code. The Sinaitic covenant has conditions; God\'s commitment to Israel\'s ultimate preservation does not. The covenant may be suspended in punishment; it cannot be annulled.'),
            ],
            'sarna': [
                ('26:40–42', 'Sarna: The restoration conditions are three: confession of iniquity, confession of the iniquity of their ancestors, and humbling the uncircumcised heart. The generational dimension (confessing ancestral sin) reflects the covenant\'s corporate nature — Israel is a community across time, not merely individuals in the present. The restoration is also corporate: the whole people returns, not merely the penitent individual.'),
            ],
            'alter': [
                ('26:42', 'Alter: "I will remember my covenant with Jacob and my covenant with Isaac and my covenant with Abraham, and I will remember the land." The triple patriarchal covenant-remembrance — Jacob, then Isaac, then Abraham — is a rhetorical inversion (youngest to oldest) that emphasises the deep roots of the promise. God\'s memory extends back to the very foundation of Israel\'s existence. No exile can reach deeper than that.'),
            ],
            'calvin': [
                ('26:40–45', 'Calvin: The restoration promise at the end of the curse section teaches that divine judgment is always penultimate and divine mercy is always ultimate. God\'s anger is for a moment; his favour is for a lifetime (Ps 30:5). The exile is not God\'s last word; the covenant is. The NT equivalent: even in the depths of human sin, Christ is the gōʾēl who redeems and restores. The last word of the covenant is always grace.'),
            ],
            'netbible': [
                ('26:45', 'NET Note: "For their sake I will remember the covenant with their ancestors whom I brought out of Egypt in the sight of the nations to be their God." The Exodus remains the covenant\'s anchor even in the depths of the exile curse. The God who brought Israel out of Egypt will bring them out of Babylon. The first Exodus grounds the promise of the second.'),
            ],
        },
    ],
})

lev(27, {
    'title': 'Vows and Dedications: Offerings Made Holy',
    'sections': [
        {
            'header': 'Verses 1–25 — Valuation of Vows: Persons, Animals, and Property',
            'verses': verse_range(1, 25),
            'heb': [
                ('neder', 'neder', 'vow', 'A voluntary, binding promise to God — typically made in a time of crisis or gratitude. The vow creates an obligation; once made, it cannot be broken without the prescribed redemption. Numbers 30 and Deut 23:21–23 emphasise: if you vow, you must pay.'),
                ('ʿerekĕkā', 'erecha', 'your valuation / the assessed value', 'The priest\'s assessed monetary value of a vowed person — a sliding scale based on age and sex. This is not the person\'s worth as a human being but the monetary equivalent for the redemption of a vow when the person cannot fulfil it in person. The values are fixed by divine decree, not market rate.'),
            ],
            'ctx': 'The final chapter of Leviticus addresses the technical procedures for fulfilling vows of dedication — when someone vows a person, animal, house, or field to the Lord. Each category has a procedure: persons are redeemed at assessed monetary values (vv.2–8); clean animals that are vowed cannot be substituted and must be given (vv.9–13); houses and fields are assessed and may be redeemed at assessed value plus 20% (vv.14–25). The purpose is to regulate the vow system — ensuring that what is dedicated to God is either given or properly redeemed, and that the process is orderly and financially specified.',
            'cross': [
                ('Eccl 5:4–5', '"When you make a vow to God, do not delay to fulfil it. He has no pleasure in fools; fulfil your vow. It is better not to make a vow than to make one and not fulfil it."'),
                ('Matt 5:33–37', '"You have heard that it was said to the people long ago, \'Do not break your oath, but fulfil to the Lord the vows you have made.\' But I tell you, do not swear an oath at all… All you need to say is simply \'Yes\' or \'No\'." Jesus does not abolish the vow principle but elevates its standard: the Christian\'s word should itself be as reliable as a vow.'),
                ('Acts 18:18', 'Paul cuts his hair because of a vow — the voluntary vow system of Lev 27 continues into the NT period as an expression of personal devotion.'),
            ],
            'mac': [
                ('27:1–8', 'MacArthur: The assessed values for persons (adult male 50 shekels, adult female 30 shekels, etc.) are not statements of human worth — they are functional equivalents for commuting a vow when the person cannot literally serve in the sanctuary. The higher values for males in prime working years reflect the economic capacity for tabernacle service, not inherent human worth.'),
                ('27:9–13', 'MacArthur: The prohibition on substituting a clean animal once vowed — even a better animal for a lesser one — reflects the principle that the sacred cannot be bargained with. What is dedicated belongs to God; to substitute is to try to renegotiate the terms of a gift already given. The sanctity of the vow is its irrevocability.'),
            ],
            'milgrom': [
                ('27:2–8', 'Milgrom: The sliding scale for assessed values (youth, working-age adult, elderly) reflects the Jubilee year\'s economic logic: value is calculated according to years of service remaining. The person vowed to the sanctuary is commuted to a monetary equivalent — the years of service they would provide converted to shekels. The scale is an actuarial table, not a moral hierarchy.'),
                ('27:14–25', 'Milgrom: The house and field redemptions (vv.14–25) apply the 20% surcharge (already familiar from Lev 5:16 and 22:14) to the redemption of dedicated property. The consistent 20% across multiple contexts suggests a standard covenant surcharge for the retrieval of holy things. The one-fifth addition signals the premium that holiness carries.'),
            ],
            'sarna': [
                ('27:9–10', 'Sarna: "If what he vowed is an animal that is acceptable as an offering to the Lord, such an animal given to the Lord becomes holy." The act of vowing transforms the animal\'s status — it crosses from the ordinary to the holy. This irreversibility is the vow system\'s theological core: dedication is ontological, not merely transactional.'),
            ],
            'alter': [
                ('27:1–8', 'Alter: The opening of the final chapter with the vow-assessment scale is characteristically anticlimactic — after the cosmic covenant speech of Lev 26, we return to actuarial tables. But this is the priestly writers\' wisdom: the covenant is not only expressed in grand pronouncements but in the mundane specifics of everyday religious life. The sacred permeates the ordinary.'),
            ],
            'calvin': [
                ('27:1–25', 'Calvin: The vow regulations teach that promises made to God must be honoured — and that God has provided a mechanism for those who cannot literally fulfil their vow. The provision of monetary redemption is grace: God does not demand the impossible but provides the possible. The Christian equivalent: when we commit ourselves to God in consecration, he does not demand perfection but provides the Spirit to fulfil what we have promised.'),
            ],
            'netbible': [
                ('27:2', 'NET Note: "If anyone makes a special vow to dedicate a person to the Lord" — the Levitical vow system is voluntary and applies to extraordinary commitments beyond the required offerings. The most famous example: Hannah\'s vow to dedicate Samuel to lifelong sanctuary service (1 Sam 1:11). The Nazirite vow (Num 6) is the most common OT application.'),
            ],
        },
        {
            'header': 'Verses 26–34 — What Cannot Be Dedicated; the Tithe',
            'verses': verse_range(26, 34),
            'heb': [
                ('ḥērem', 'cherem', 'devoted thing / set apart for destruction / irrevocably dedicated', 'The most extreme form of dedication — totally given to God, unredeemable. What is ḥērem belongs absolutely to God; it cannot be redeemed or sold. The Canaanite cities under ḥērem in the conquest must be totally destroyed; the spoils belong to God, not to Israel.'),
                ('kol-maʿśar hāʾāreṣ', 'kol-ma\'asar ha\'aretz', 'all the tithe of the land', 'The closing tithe legislation (vv.30–33): one-tenth of grain, fruit, and every tenth animal belongs to the Lord. What belongs to the Lord may be redeemed (adding 20%) or simply given. The tithe is not a vow but a covenant obligation — a permanent claim of the divine owner on one-tenth of all produce.'),
            ],
            'ctx': 'The final section distinguishes between what can and cannot be dedicated: firstborn animals already belong to God (v.26) — you cannot vow what already belongs to God. The ḥērem (devoted thing, v.28) is the most absolute dedication — once ḥērem, always ḥērem, unredeemable. The tithe (vv.30–33) closes the book: the land\'s produce is subject to a mandatory one-tenth dedication. The final verse (v.34) is the book\'s colophon: "These are the commands the Lord gave Moses at Mount Sinai for the Israelites." Leviticus is sealed as a Sinaitic document.',
            'cross': [
                ('Mal 3:10', '"Bring the whole tithe into the storehouse, that there may be food in my house. \'Test me in this,\' says the Lord Almighty, \'and see if I will not throw open the floodgates of heaven and pour out so much blessing that there will not be room enough to store it.\'" The Lev 27 tithe becomes in Malachi the test of covenant faithfulness.'),
                ('Heb 7:8–9', '"In the one case, the tenth is collected by people who die; but in the other case, by him who is declared to be living. One might even say that Levi, who collects the tenth, paid the tenth through Abraham, since when Melchizedek met Abraham, Levi was still in the body of his ancestor." The author of Hebrews uses the tithe to establish the superiority of Christ\'s Melchizedekian priesthood.'),
                ('Matt 23:23', '"You give a tenth of your spices — mint, dill and cumin. But you have neglected the more important matters of the law — justice, mercy and faithfulness." Jesus affirms the tithe while insisting it is incomplete without the weightier ethical obligations of the covenant.'),
            ],
            'mac': [
                ('27:28–29', 'MacArthur: The ḥērem is the most radical form of dedication in the Levitical system — it is absolute and irrevocable. No human redemption is possible. Achan\'s sin (Josh 7) was precisely the appropriation of ḥērem goods from Jericho; he treated the absolutely-holy as available for human use, and the covenant\'s judgment was severe. The ḥērem is not a human gift to God — it is a divine sequestration.'),
                ('27:30–33', 'MacArthur: The tithe closes Leviticus. Every tenth of the land\'s produce and every tenth animal belongs to the Lord — not as a gift but as a covenant obligation. The tithe is not charity (discretionary) but acknowledgment (covenantal): one-tenth is God\'s because the land is God\'s. The farmer who tithes acknowledges the divine landlord; the farmer who withholds the tithe is embezzling from the covenant.'),
            ],
            'milgrom': [
                ('27:30–33', 'Milgrom: The tithe of animals is struck every tenth as they pass under the shepherd\'s staff — the tenth that passes out regardless of quality becomes holy. No substitution is allowed; if substitution is attempted, both the original and the substitute become holy. The tithe\'s randomness (it takes whatever is tenth) protects against the tendency to give the worst tenth to God.'),
                ('27:34', 'Milgrom: The colophon — "These are the commands the Lord gave Moses at Mount Sinai for the Israelites" — is identical in structure to the Exodus colophon (Exod 31:18) and the Numbers introduction (Num 1:1). It seals Leviticus as a Sinaitic document: everything within it has the authority of the Sinai revelation. No subsequent generation may set it aside as merely Moses\'s opinion.'),
            ],
            'sarna': [
                ('27:34', 'Sarna: The book\'s closing formula — at Mount Sinai, for the Israelites — grounds Leviticus in both a specific historical moment (Sinai) and a specific community (Israel). The legislation is neither universal human ethics (though much of it embodies universal principles) nor mere cultural convention, but a specific covenant document binding a specific people to a specific God at a specific moment that was nevertheless determinative for all time.'),
            ],
            'alter': [
                ('27:34', 'Alter: "These are the commands the Lord gave Moses at Mount Sinai for the Israelites." After 27 chapters of sacrifice law, purity law, ordination narrative, holiness code, sacred calendar, covenant blessings and curses, and vow regulations — this spare colophon seals it all. The entire edifice of Levitical law rests on one foundation: the divine word at Sinai, given through Moses, for Israel. The book\'s final word is its first word: revelation.'),
            ],
            'calvin': [
                ('27:30–34', 'Calvin: The tithe closes Leviticus with the reminder that covenant living is comprehensive — even the harvest\'s arithmetic is theological. One-tenth is the Lord\'s because all is the Lord\'s; the tithe is a visible expression of the invisible truth that the covenant community owns nothing absolutely. The closing colophon — "at Mount Sinai" — seals the book\'s authority: not human legislation, not priestly tradition, but divine command. Leviticus is God\'s word for God\'s people.'),
            ],
            'netbible': [
                ('27:34', 'NET Note: The Sinaitic colophon ("at Mount Sinai") closes not just Lev 27 but the entire book. It distinguishes Leviticus\'s legislation from Sinai-period ordinances from post-Sinai legislation (which receives different introductory formulas). The colophon is an editorial claim: every regulation in this book was received at the mountain of revelation. It is the priestly writers\' equivalent of "thus says the Lord."'),
            ],
        },
    ],
})

print("LEV-6 complete: Leviticus 23–27 built.")
