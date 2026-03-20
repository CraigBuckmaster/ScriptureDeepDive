"""DEUT-4: Deuteronomy chapters 19–26 — Criminal, Family, Military, Firstfruits"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from shared import build_chapter, verse_range

def deu(ch, data):
    build_chapter('deuteronomy', ch, data)

deu(19, {
    'title': 'Cities of Refuge; Property Boundaries; Witnesses',
    'sections': [
        {
            'header': 'Verses 1–14 — Three Cities of Refuge; Boundary Stones',
            'verses': verse_range(1, 14),
            'heb': [
                ('arei hamiklaṭ', 'arei hamiklaṭ', 'cities of refuge',
                 'The three Cisjordan cities of refuge (complementing the three in Transjordan, 4:41-43) provide asylum for the unintentional killer. The institution distinguishes between accidental death and murder -- a legal distinction ancient societies often failed to make. The city of refuge is mercy built into the landscape.'),
                ('lo tasteg gevul reakha', 'lo tasteg gevul reakha', 'do not move your neighbour\'s boundary stone',
                 'The property boundary prohibition protects the covenant land allocation -- each family\'s portion is a God-given inheritance. Moving a boundary stone was theft without violence but with permanent consequences. The prophets condemn this extensively (Hos 5:10; Prov 22:28).'),
            ],
            'ctx': 'Chapter 19 addresses three legal provisions: (1) cities of refuge for the unintentional killer (vv.1-13) -- the system presupposes a meaningful distinction between murder and manslaughter; (2) boundary markers protecting property inheritance (v.14); (3) the law of witnesses (vv.15-21). The cities of refuge require a network of roads so the fugitive can reach safety quickly. Three cities are mandated, with provision for three more if Israel\'s territory expands (v.9).',
            'cross': [
                ('Heb 6:18', '"We who have fled to take hold of the hope set before us may be greatly encouraged." Hebrews uses the cities of refuge as a type of Christ -- the one who flees to him finds asylum from the righteous judgment he deserves.'),
                ('Num 35:9-28', 'Numbers provides the full theological rationale that Deuteronomy 19 assumes -- intentional vs. unintentional homicide, the role of the congregation, and the limitation on the blood avenger.'),
            ],
            'mac': [
                ('19:1-7', 'MacArthur: The cities of refuge embody a profound principle: justice must be calibrated to intent. The accidental killer and the deliberate murderer have caused the same physical outcome -- a death. But their moral culpability is entirely different, and the law insists on this distinction. The heart\'s intent matters as much as the hand\'s act.'),
                ('19:11-13', 'MacArthur: "But if out of hatred a man murders his neighbour deliberately... the elders of his town shall send for him, bring him back from the city, and hand him over to the avenger of blood to die." The city of refuge provides no shelter for deliberate murder -- only for accidental killing. The refuge is not a general amnesty but a specific protection for the morally innocent.'),
                ('19:14', 'MacArthur: "Do not move your neighbour\'s boundary stone set up by your predecessors in the inheritance you receive." Boundary stones represented the family\'s God-given covenant inheritance -- their portion of the promised land. To move a boundary stone was to steal from God\'s gift allocation, not merely from a neighbour.'),
                ('19:5', 'MacArthur: The example of an accidental killing -- a man swings an axe and the head flies off and kills his companion -- shows the law\'s concern for genuine accidents. The detailed example is pastoral: Moses is not writing abstract legal theory but providing concrete guidance for real situations that arise in community life.'),
            ],
            'craigie': [
                ('19:1-13', 'Craigie: The cities of refuge reflect sophisticated legal reasoning about culpability. The distinction between intentional and unintentional killing is not unique to Israel\'s law, but Deuteronomy\'s provision of asylum cities as a mercy institution is remarkable. The cities create physical space for due process between the act of killing and the execution of judgment.'),
            ],
        },
        {
            'header': 'Verses 15–21 — Two Witnesses Required; False Testimony Punished',
            'verses': verse_range(15, 21),
            'heb': [
                ('al pi shnayim edim', 'al pi shnayim edim', 'on the testimony of two or three witnesses',
                 'The two-witness rule is a cornerstone of Deuteronomic legal procedure. No capital sentence may be executed on a single witness\'s testimony. The NT extends this to church discipline (Matt 18:16) and apostolic credibility (2 Cor 13:1).'),
                ('lo tachos einekha', 'lo tachos einekha', 'your eye shall not pity',
                 'The repeated formula "show no pity" in Deuteronomic law is not callousness but proportionality. Pity that distorts justice is injustice toward the wronged party. The talion principle -- eye for eye -- is judicial proportionality at its purest: punishment must match the crime, no more and no less.'),
            ],
            'ctx': 'The law of witnesses (vv.15-21) establishes two foundational principles: the two-witness requirement for conviction, and the talion principle for false witnesses. False witnesses receive the punishment they sought to inflict on the accused -- a powerful disincentive. The "eye for eye, tooth for tooth" (v.21) principle is not vindictiveness but proportionality: punishment may not exceed the crime. This actually limits revenge rather than enabling it.',
            'cross': [
                ('Matt 5:38-39', '"You have heard that it was said, \'An eye for an eye and a tooth for a tooth.\' But I tell you, do not resist an evil person." Jesus quotes the Deuteronomy 19 lex talionis -- not to abolish it as a judicial principle but to exceed it in personal ethics.'),
                ('Matt 18:16', '"Take one or two others along, so that every matter may be established by the testimony of two or three witnesses." Jesus applies the Deuteronomy 17/19 two-witness rule to church discipline.'),
            ],
            'mac': [
                ('19:15', 'MacArthur: "One witness is not enough to convict anyone accused of any crime or offense they may have committed. A matter must be established by the testimony of two or three witnesses." This fundamental principle of due process protects individuals from false accusation. The entire justice system\'s integrity depends on preventing a single malicious witness from destroying an innocent person.'),
                ('19:16-19', 'MacArthur: The process for handling a false witness -- both parties must stand before the LORD before the priests and judges -- ensures that accusation and defence receive equal hearing. The judges who investigate thoroughly and find the witness false then impose mirror-image punishment. The legal system\'s integrity is protected by making false accusation maximally costly.'),
                ('19:19-21', 'MacArthur: "Show no pity: life for life, eye for eye, tooth for tooth, hand for hand, foot for foot." The talion principle is judicial proportionality at its purest. Its purpose is not vengeance but restraint -- punishment may not exceed the crime. The eye-for-eye standard actually limits revenge by specifying a maximum, not a minimum.'),
            ],
        },
    ],
})

deu(20, {
    'title': 'Rules for Warfare: Fear God, Not the Enemy',
    'sections': [
        {
            'header': 'Verses 1–9 — Military Exemptions; the Priest\'s Address',
            'verses': verse_range(1, 9),
            'heb': [
                ('lo tira mehem', 'lo tira mehem', 'do not be afraid of them',
                 'The military address begins with the fear prohibition. The army\'s fundamental qualification is not military skill but covenant trust. The priest\'s address before battle is theology, not tactics: God is with you; do not fear.'),
                ('mi haish hayare verak halevav', 'mi haish hayare verak halevav',
                 'who is the man who is fearful and fainthearted?',
                 'The fearful soldier is exempted from battle -- not as punishment but as protection for the army. A fearful soldier is a contagion: his fear infects others and undermines collective courage. The Gideon narrative (Judg 7:3) applies exactly this Deuteronomic principle.'),
            ],
            'ctx': 'Chapter 20 provides rules of engagement for warfare. Before battle, a priest addresses the army: God is with you; do not fear. Then officers identify four exemptions: new house, new vineyard, new marriage, and fearful heart. The four categories of incompleteness -- things started but not finished -- excuse a soldier because they divide attention and heart. Covenant warfare requires wholehearted soldiers.',
            'cross': [
                ('Judg 7:3', '"Gideon announced, \'Anyone who trembles with fear may turn back.\' So twenty-two thousand men left, while ten thousand remained." Gideon\'s fearful-soldier discharge is the explicit application of Deuteronomy 20:8.'),
                ('Luke 14:31-32', '"Suppose a king is about to go to war against another king. Won\'t he first sit down and consider whether he is able... to oppose the one coming against him?" Jesus\'s parable reflects the Deuteronomy 20 principle of counting the cost before engaging.'),
            ],
            'mac': [
                ('20:1-4', 'MacArthur: "When you go to war against your enemies and see horses and chariots and an army greater than yours, do not be afraid of them, because the LORD your God, who brought you out of Egypt, will be with you." The logic is explicit: the same God who overcame Pharaoh\'s horses and chariots is present for every subsequent battle. Fear of military disparity is answered not by capability assessment but by theological memory.'),
                ('20:5-9', 'MacArthur: The four exemptions -- new house, new vineyard, new marriage, fearful heart -- reflect a theology of completion. A man who has started something and not finished it has a divided heart. Covenant warfare requires wholehearted soldiers. The fearful soldier\'s exemption is not weakness accommodation but community protection: fear is contagious and one fearful soldier can undo many brave ones.'),
            ],
            'craigie': [
                ('20:1-4', 'Craigie: The priest\'s pre-battle address is a covenant liturgy -- Israel goes to war as God\'s covenant people, not as an ordinary army. The divine warrior fights for Israel; human courage is the appropriate response to divine presence, not the basis of victory. This is the theological framework that makes Gideon\'s 300 possible.'),
            ],
        },
        {
            'header': 'Verses 10–20 — Treatment of Cities; Fruit Trees Preserved',
            'verses': verse_range(10, 20),
            'heb': [
                ('davar shalom', 'davar shalom', 'terms of peace / words of peace',
                 'The requirement to offer peace before besieging a distant city shows that war is the last resort. Even in the context of military campaign, Israel is first a peacemaker. The exception is Canaanite cities -- but even there, the herem is a judicial act, not a preference for violence.'),
                ('ki haAdam etz hasadeh', 'ki haAdam etz hasadeh', 'for the tree of the field is man\'s life',
                 'The trees of the field are identified with human life -- they sustain it. The prohibition on cutting down fruit trees even in warfare is one of the most ecologically protective commands in the ancient world. Creation belongs to God and must not be wantonly destroyed even in conflict.'),
            ],
            'ctx': 'The rules of engagement distinguish between distant cities (offer peace first; if refused, besiege and enslave; if they fight, kill the men and take the rest) and Canaanite cities (herem -- total destruction). Even in the most severe military action, fruit trees around besieged cities must not be cut down -- they serve life and must not be destroyed in the service of death. The distinction between people who may be killed and trees that must be preserved shows that the warfare rules have a consistent ecological-humanitarian framework.',
            'cross': [
                ('Matt 5:9', '"Blessed are the peacemakers, for they will be called children of God." The Deuteronomy 20 requirement to offer peace first is the OT anticipation of the peacemaker beatitude.'),
                ('Rev 7:3', '"Do not harm the land or the sea or the trees until we put a seal on the foreheads of the servants of our God." Revelation\'s protection of creation echoes the Deuteronomy 20 tree-protection command in eschatological form.'),
            ],
            'mac': [
                ('20:10-12', 'MacArthur: "When you march up to attack a city, make its people an offer of peace first." The requirement to offer peace before besieging a distant city shows that war is the last resort, not the first. Even in the context of military campaign, Israel is first a peacemaker. This restraint is the mark of a nation whose God is the God of shalom.'),
                ('20:16-18', 'MacArthur: The herem applied to Canaanite cities is best understood as divine judicial execution -- the communities so corrupted by their religious practices that coexistence would mean Israel\'s spiritual death. The prophets who came before (Gen 15:16, "the sin of the Amorites has not yet reached its full measure") demonstrate that God\'s patience was extraordinary and his judgment was delayed as long as possible.'),
                ('20:19-20', 'MacArthur: "When you lay siege to a city for a long time... do not destroy its trees by putting an axe to them... Do not cut them down." The prohibition on destroying fruit trees -- even in warfare -- is one of the most environmentally protective commands in the ancient world. Trees that produce food are protected even when they are the enemy\'s trees, because they serve life.'),
            ],
        },
    ],
})

deu(21, {
    'title': 'Unsolved Murder; Captive Women; Firstborn Rights; Rebellious Sons',
    'sections': [
        {
            'header': 'Verses 1–14 — Unsolved Murder; Female Captive',
            'verses': verse_range(1, 14),
            'heb': [
                ('eretz asher YHWH elohekha noten lekha', 'eretz asher YHWH elohekha noten lekha',
                 'the land which the LORD your God is giving you',
                 'The land-gift formula brackets the chapter: the community that inhabits the land God has given must maintain the land\'s purity. An unsolved murder in the land contaminates it; the heifer ceremony removes the defilement.'),
                ('nashim yefat toar', 'nashim yefat toar', 'women of beautiful form',
                 'The captive woman law is remarkable for its protection of a conquered woman\'s dignity. She may mourn her family for a full month before becoming anyone\'s wife. If the man divorces her, she goes free -- she cannot be sold as a slave.'),
            ],
            'ctx': 'Chapter 21 collects four case laws: (1) an unsolved murder -- the nearest town performs an expiation ceremony to purge blood-guilt from the land (vv.1-9); (2) a female captive taken in warfare -- she must be given time to grieve before marriage, and if divorced she goes free (vv.10-14). Both laws reflect the same principle: covenant community life must respect the dignity of persons and the moral ecology of the land God has given.',
            'cross': [
                ('Num 35:33-34', '"Do not pollute the land where you are. Bloodshed pollutes the land, and atonement cannot be made for the land on which blood has been shed, except by the blood of the one who shed it." Numbers provides the theological rationale for the Deuteronomy 21 heifer ceremony.'),
            ],
            'mac': [
                ('21:1-9', 'MacArthur: The heifer ceremony for unsolved murder is one of the OT\'s most striking provisions. An unsolved murder creates blood-guilt in the land -- the community is contaminated by a death it did not cause and cannot directly atone for. The elders declare their innocence. Community responsibility for justice does not end when the guilty party cannot be found.'),
                ('21:10-14', 'MacArthur: The captive woman law is remarkable for its protection of a conquered woman\'s dignity. In a world where conquered women were routinely enslaved or worse, Deuteronomy provides extraordinary dignity protections. She may mourn for a full month; if divorced, she goes free. The slave trade in female captives is implicitly prohibited.'),
                ('21:7-8', 'MacArthur: The elders\' declaration over the heifer -- "Our hands did not shed this blood, nor did our eyes see it done. Accept this atonement for your people Israel" -- is one of the most moving liturgical moments in Deuteronomy. The entire community declares innocence and seeks atonement for an act none of them committed. Corporate responsibility before God is a covenant reality, not merely a legal fiction.'),
            ],
            'craigie': [
                ('21:1-9', 'Craigie: The heifer ceremony demonstrates that Deuteronomy\'s legal concern extends beyond individual guilt to community responsibility. A community that harbours unsolved violence is not innocent. The ceremony simultaneously purges guilt and affirms the community\'s commitment to justice -- "we did not shed this blood" is both a declaration of innocence and a commitment to future diligence.'),
            ],
        },
        {
            'header': 'Verses 15–23 — Firstborn Rights; Rebellious Sons; the Hanged Body',
            'verses': verse_range(15, 23),
            'heb': [
                ('bekhora', 'bekhora', 'firstborn rights / double portion',
                 'The firstborn\'s double portion is a legal right that parental emotion cannot override. The unloved wife\'s firstborn son cannot be disinherited in favour of the loved wife\'s son. The covenant protects the vulnerable against the powerful -- even within the family.'),
                ('kelalet Elohim taluy', 'kelalet Elohim taluy', 'cursed of God is the one who is hung',
                 'Deuteronomy 21:23 is quoted by Paul in Galatians 3:13: "Christ redeemed us from the curse of the law by becoming a curse for us." The verse is the OT textual basis for understanding the crucifixion as Christ bearing the covenant curse.'),
            ],
            'ctx': 'The chapter continues with: (3) the rights of the firstborn in a polygamous household -- the firstborn of the unloved wife receives the double portion regardless of paternal preference (vv.15-17); (4) the rebellious son -- if incorrigible, he is to be brought before the elders for community judgment (vv.18-21); (5) the hanging-on-a-tree legislation -- a body must be buried before nightfall, for a hanged man is under God\'s curse (vv.22-23). Paul applies v.23 directly to the crucifixion in Galatians 3:13.',
            'cross': [
                ('Gal 3:13', '"Christ redeemed us from the curse of the law by becoming a curse for us, for it is written: \'Cursed is everyone who is hung on a pole.\'" Paul directly quotes Deuteronomy 21:23 to interpret the crucifixion. The cross is where Jesus bore the covenant curse that Israel\'s disobedience incurred.'),
                ('John 19:31', '"The Jewish leaders did not want the bodies left on the crosses during the Sabbath... they asked Pilate to have the legs broken and the bodies taken down." The urgency reflects the Deuteronomy 21:22-23 requirement.'),
            ],
            'mac': [
                ('21:15-17', 'MacArthur: The firstborn protection law ensures that legal rights cannot be overridden by paternal emotion. A father may love one wife more than another, but the firstborn\'s double portion is a legal right that love cannot annul. The covenant protects the structurally vulnerable -- even against the well-meaning preferences of those in authority over them.'),
                ('21:18-21', 'MacArthur: The rebellious son law is often misread as giving parents the power of execution. Closer reading shows the opposite: the parents bring the case before the town elders -- they are not judge, jury, and executioner. The extreme consequence (execution) is reserved for a son who is "stubborn and rebellious... a glutton and a drunkard" -- incorrigibly self-destructive and a threat to community welfare.'),
                ('21:22-23', 'MacArthur: "Anyone who is hung on a pole is under God\'s curse." Paul\'s application to the cross (Gal 3:13) is profound: at Calvary, the sinless one bore the curse that sinners deserve, in the body that was hastily buried before nightfall. The most shameful death in the OT legal vocabulary became the vehicle of the world\'s salvation.'),
            ],
        },
    ],
})

deu(22, {
    'title': 'Sexual Ethics and Social Law: Protecting Life and Dignity',
    'sections': [
        {
            'header': 'Verses 1–12 — Lost Property; Mixed Kinds; Safety',
            'verses': verse_range(1, 12),
            'heb': [
                ('lo tireh', 'lo tireh', 'you shall not ignore / you shall not hide yourself',
                 'The repeated "do not ignore it" (lo tireh, do not hide yourself) is the covenant community\'s antidote to the bystander effect. Active neighbour-love is not optional; passive neglect of the obvious need is a covenant violation.'),
                ('sha\'atnez', 'sha\'atnez', 'mixed kinds / wool and linen together',
                 'The prohibition of mixed kinds -- sha\'atnez (wool and linen mixed), different seeds in one vineyard, ox and donkey ploughing together -- enforces categorical distinctions that are part of creation\'s structure. The laws embody a theology of categories: God created by distinguishing, and his people must respect those distinctions.'),
            ],
            'ctx': 'Chapter 22 covers a wide range of laws. The opening section addresses: returning lost property (vv.1-4), prohibition of cross-dressing (v.5), not taking a mother bird with eggs (vv.6-7), roof parapets for safety (v.8), and mixed-kinds laws (vv.9-12). These laws share a common principle: respect the distinctions God has built into creation and protect life wherever it appears -- lost animals, birds\' nests, human lives on flat rooftops.',
            'cross': [
                ('Matt 10:29-31', '"Are not two sparrows sold for a penny? Yet not one of them will fall to the ground outside your Father\'s care." Jesus\' statement about sparrows echoes the mother-bird law\'s concern for even small creatures.'),
                ('Rom 13:10', '"Love does no harm to a neighbour. Therefore love is the fulfilment of the law." Paul\'s summary of love-as-law-fulfilment captures the principle behind Deuteronomy 22\'s practical love-for-neighbour legislation.'),
            ],
            'mac': [
                ('22:1-4', 'MacArthur: "If you see your fellow Israelite\'s ox or sheep straying, do not ignore it but be sure to take it back to its owner... Do not ignore it." The repeated "do not ignore it" -- used three times in these verses -- is the covenant community\'s antidote to the bystander effect. Active neighbour-love is not optional; passive neglect of the obvious need is a covenant violation.'),
                ('22:6-7', 'MacArthur: "If you come across a bird\'s nest beside the road... do not take the mother with the young. You may take the young, but be sure to let the mother go, so that it may go well with you and you may have a long life." The mother-bird law is the OT\'s most striking ecological protection for a wild animal. Its rationale is not merely sentimental but structured: don\'t destroy the source of future life. Sustainable use of creation is a covenant principle.'),
                ('22:8', 'MacArthur: "When you build a new house, make a parapet around your roof, so that you may not bring the guilt of bloodshed on your house if someone falls from the roof." The parapet law is the OT\'s building safety code -- and its theological grounding is more profound than any regulation. Life is so sacred that its loss through preventable accident creates blood-guilt. Negligence that results in death is culpable.'),
                ('22:9-12', 'MacArthur: The mixed-kinds laws -- different seeds, ox and donkey, wool and linen -- enforce the categorical distinctions God built into creation. These are not arbitrary rules but applications of the creation principle that God creates by distinguishing (Gen 1: light from darkness, water from land, kinds after their kinds). Respecting those distinctions is a form of covenant faithfulness.'),
            ],
        },
        {
            'header': 'Verses 13–30 — Sexual Integrity Laws',
            'verses': verse_range(13, 30),
            'heb': [
                ('unat ishah betulat Yisrael', 'unat ishah betulat Yisrael',
                 'he has disgraced a virgin of Israel',
                 'The sexual dignity laws use "Israel" -- defiling a woman is not merely a private wrong but a communal and covenantal offence. Sexual integrity is a corporate covenant matter. The phrase "a disgraceful thing in Israel" appears repeatedly as the covenant community\'s verdict on sexual violation.'),
            ],
            'ctx': 'The sexual laws address: a husband\'s false accusation of his wife (vv.13-21), adultery (v.22), sexual assault in city and field (vv.23-27), rape of an unmarried woman (vv.28-29), and sex with a father\'s wife (v.30). The laws consistently protect women\'s dignity and sexual integrity while imposing severe penalties on violators. The distinction between city assault (presumed complicit) and field assault (presumed non-complicit) reflects a presumption of innocence for the party who could not have been heard if she cried out.',
            'cross': [
                ('Matt 5:27-28', '"You have heard that it was said, \'You shall not commit adultery.\' But I tell you that anyone who looks at a woman lustfully has already committed adultery with her in his heart." Jesus deepens the Deuteronomy 22 sexual ethics from the act to the intent.'),
                ('1 Cor 6:18-20', '"Flee from sexual immorality... your bodies are temples of the Holy Spirit." Paul\'s sexual ethics are grounded in the same corporate-body theology as Deuteronomy 22 -- sexual sin affects the covenant community, not just the individual.'),
            ],
            'mac': [
                ('22:13-21', 'MacArthur: The false accusation of adultery law is remarkable: a husband who falsely charges his wife with premarital unchastity is punished (flogged, fined), forbidden to divorce her, and the wife is fully vindicated. The law protects women from being victimized by false accusations and from the social death of a divorce that destroys reputation.'),
                ('22:22', 'MacArthur: "If a man is found sleeping with another man\'s wife, both the man who slept with her and the woman must die." The adultery law applies equally to both parties -- neither gender is exempt from the covenant\'s sexual obligations. The equal application is unusual in the ancient world, where women were often punished more severely.'),
                ('22:25-27', 'MacArthur: "If the man meets the girl out in the country... the man alone shall die. Do nothing to the woman; she has committed no sin deserving death." The presumption of innocence for the field assault victim -- "she cried out but there was no one around to save her" -- is the OT\'s protection of the non-consenting party. The violator faces the full legal consequence; the victim faces none.'),
            ],
        },
    ],
})

deu(23, {
    'title': 'The Assembly of the LORD; Camp Purity; Various Laws',
    'sections': [
        {
            'header': 'Verses 1–14 — Assembly Exclusions; Camp Holiness',
            'verses': verse_range(1, 14),
            'heb': [
                ('kehal YHWH', 'kehal YHWH', 'the assembly of the LORD',
                 'The "assembly of the LORD" (qahal) is the formal covenant community gathered for worship or military action. Certain conditions exclude membership -- not as permanent ethnic exclusions but as covenant-community boundary markers. The qahal is the OT predecessor of the NT assembly (ekklesia).'),
                ('machane', 'machane', 'camp / sacred military encampment',
                 'God is present among the soldiers. The camp\'s purity requirements reflect the holiness of the divine presence: "the LORD your God moves about in your camp to protect you... Your camp must be holy, so that he will not see among you anything indecent and turn away from you" (v.14).'),
            ],
            'ctx': 'Chapter 23 contains assembly exclusion laws (vv.1-8), camp purity regulations (vv.9-14), and various social laws. The exclusions -- certain physical conditions, Ammonites and Moabites, Edomites and Egyptians -- reflect covenant-community boundaries and historical relationships. The camp purity laws include latrine requirements outside the camp because God walks in the camp. This is the most visceral expression of the principle that holiness touches every area of life, including sanitation.',
            'cross': [
                ('2 Cor 6:17', '"Come out from them and be separate, says the Lord. Touch no unclean thing, and I will receive you." Paul applies the Deuteronomy 23 purity principle to the church\'s separation from idolatrous culture.'),
                ('Rev 21:27', '"Nothing impure will ever enter it, nor will anyone who does what is shameful or deceitful." The New Jerusalem\'s purity requirements echo Deuteronomy 23\'s assembly exclusions in eschatological form.'),
            ],
            'mac': [
                ('23:3-5', 'MacArthur: "No Ammonite or Moabite or any of their descendants may enter the assembly of the LORD... because they did not come to meet you with bread and water on your way when you came out of Egypt, and because they hired Balaam to pronounce a curse on you." The exclusion is for specific historical covenant failures, not ethnicity. Ruth, a Moabite, is fully incorporated into Israel -- the exclusion applies to those who maintain hostility, not to those who convert.'),
                ('23:9-14', 'MacArthur: The camp purity laws include a literal latrine regulation: soldiers must have a designated latrine outside the camp, and waste must be buried. The theological rationale: "the LORD your God moves about in your camp to protect you... Your camp must be holy." The holy God\'s presence demands physical cleanliness as well as moral purity. Holiness is not spiritualised away from physical reality.'),
                ('23:15-16', 'MacArthur: "If a slave has taken refuge with you, do not hand them over to their master. Let them live among you wherever they like." The protection of escaped slaves is remarkable -- the law actively protects those fleeing servitude. Israel, enslaved in Egypt and liberated by God, must not become an instrument of re-enslavement.'),
            ],
            'craigie': [
                ('23:9-14', 'Craigie: The camp purity regulations are not merely hygienic but theological. The presence of God among the soldiers transforms the military camp into a sacred space. The same principles that govern sanctuary holiness govern the battle camp -- because God is there. This sanctification of the military reflects the covenant conception of warfare as divine action.'),
            ],
        },
        {
            'header': 'Verses 15–25 — Escaped Slaves; Sacred Prostitution; Interest; Vows; Gleaning',
            'verses': verse_range(15, 25),
            'heb': [
                ('neshekh', 'neshekh', 'interest / usury',
                 'The prohibition of charging interest to fellow Israelites (while permitting it to foreigners) is a covenant community solidarity law. Profit from a neighbour\'s desperate need violates the communal ethos of the covenant. The distinction between Israelite and foreigner reflects covenant community boundary-marking.'),
                ('vow / neder', 'neder', 'vow',
                 'Vows made to God are binding without exception. The voluntary nature of the vow (you are not required to make one) makes its binding character absolute: having promised, you must fulfil. The vow law enforces integrity of speech before God.'),
            ],
            'ctx': 'The chapter concludes with: protection of escaped slaves (vv.15-16), prohibition of sacred prostitution (vv.17-18), interest laws (vv.19-20), vow obligations (vv.21-23), and the gleaning law (vv.24-25). The gleaning law -- you may eat your neighbour\'s grapes or grain when passing through, but you may not take any away -- is a practical mechanism for providing for the hungry through dignity-preserving access, not charity handouts.',
            'cross': [
                ('Matt 5:37', '"Let your \'Yes\' be \'Yes,\' and your \'No,\' \'No.\'" Jesus applies the Deuteronomy 23 vow principle to all speech -- integrity before God extends to every word.'),
                ('Ruth 2:15-17', 'The entire book of Ruth is set within the gleaning laws -- Boaz\'s protection of Ruth is the Deuteronomy 23 gleaning law in action at its most generous.'),
            ],
            'mac': [
                ('23:19-20', 'MacArthur: The prohibition of charging interest to fellow Israelites is a covenant community solidarity law. Profit from a neighbour\'s desperate need violates the communal ethos. The distinction between Israelite and foreigner is not ethnic favoritism but covenant community boundary-marking: those in the covenant family care for each other differently than they interact with those outside.'),
                ('23:21-23', 'MacArthur: "If you make a vow to the LORD your God, do not be slow to pay it... Whatever your lips utter you must be sure to do." The vow law enforces integrity of speech. The permission not to vow at all (v.22) makes the binding character of a vow absolute: once made, it cannot be retracted. Better not to promise than to promise and not fulfil (cf. Eccl 5:4-5).'),
                ('23:24-25', 'MacArthur: The gleaning law -- eat what you can reach but take nothing away -- is a practical provision for the hungry that preserves dignity. The hungry person is not a charity case but an active participant: they do the work of gleaning. The limitation (you cannot take more than you can eat) prevents exploitation. Boaz and Ruth demonstrate this system at its ideal.'),
            ],
        },
    ],
})

deu(24, {
    'title': 'Marriage and Divorce; Social Justice Laws; Protecting the Vulnerable',
    'sections': [
        {
            'header': 'Verses 1–13 — Divorce Regulation; Exemptions; Pledge Laws',
            'verses': verse_range(1, 13),
            'heb': [
                ('sefer keritut', 'sefer keritut', 'certificate of divorce',
                 'The divorce certificate creates a legal record protecting the woman\'s right to remarry. Moses allows divorce because of hardness of heart (Matt 19:8); the law manages and limits the damage of a fallen practice. The law is protection legislation, not endorsement legislation.'),
                ('chaburah', 'chaburah', 'pledge / security for a loan',
                 'The pledge laws protect the poor from exploitation by creditors. Taking a person\'s cloak as pledge and not returning it by nightfall leaves them without covering for the cold night. The covenant frames creditor-debtor relations within the ethic of neighbour-love.'),
            ],
            'ctx': 'Chapter 24 opens with the famous marriage/divorce regulation (vv.1-4) and combines it with humanitarian provisions: exemption from military service for newly married men (v.5), prohibition on taking millstones as pledges (v.6), consequences for kidnapping (v.7), and pledge laws protecting the poor (vv.10-13). The chapter\'s common thread is protecting the vulnerable from exploitation -- especially those in economically precarious positions.',
            'cross': [
                ('Matt 19:3-9', '"Moses permitted you to divorce your wives because your hearts were hard. But it was not this way from the beginning." Jesus uses Deuteronomy 24 to distinguish God\'s creation intention from Moses\'s accommodation of human sinfulness.'),
                ('Jas 5:4', '"Look! The wages you failed to pay the workers who mowed your fields are crying out against you." James\'s condemnation of wage withholding is the NT application of Deuteronomy 24:14-15\'s same-day payment requirement.'),
            ],
            'mac': [
                ('24:1-4', 'MacArthur: The divorce certificate exists to protect the woman -- it gives her legal status as a divorced woman, enabling her to remarry. The prohibition on remarrying the first husband after she has married another prevents women from being treated as objects passed between men. Deuteronomy 24 is protection legislation in the protective sense.'),
                ('24:5', 'MacArthur: "If a man has recently married, he must not be sent to war or have any other duty laid on him. For one year he is to be free to stay at home and bring happiness to the wife he has married." The new-marriage exemption shows that the covenant community values the founding of a marriage so highly that military service yields to it.'),
                ('24:10-13', 'MacArthur: "When you make a loan of any kind to your neighbour, do not go into their house to get what is offered to you as a pledge. Stay outside and let the neighbour to whom you are making the loan bring the pledge out to you." The dignity of the debtor\'s home is preserved even in a financial transaction. The creditor must not enter uninvited. The cloak must be returned by nightfall so the poor person is not cold.'),
            ],
            'craigie': [
                ('24:1-4', 'Craigie: The divorce legislation is not a positive endorsement of divorce but a regulatory framework protecting the woman whose husband has decided to divorce her. The certificate creates legal status; the prohibition on re-marriage to the first husband creates a boundary against casual treatment of marriage. The law takes the reality of divorce seriously while surrounding it with protections.'),
            ],
        },
        {
            'header': 'Verses 14–22 — Wages; Individual Guilt; Gleaning for the Vulnerable',
            'verses': verse_range(14, 22),
            'heb': [
                ('bikhur', 'bikhur', 'firstfruits / first ripe',
                 'The gleaning laws (vv.19-21) -- leave the forgotten sheaf, the remaining olives, the leftover grapes -- reflect the theology of firstfruits: the first and the last both belong to God and his poor. Not efficiency-maximizing the harvest is a covenant act of trust.'),
                ('lo yumat avot al banim', 'lo yumat avot al banim',
                 'fathers shall not be put to death for their children',
                 'The principle of individual culpability -- each person dies for their own sin -- is a legal principle but also a theological one. Covenant consequences are not automatically inherited; each person stands before God and the law on their own account.'),
            ],
            'ctx': 'The chapter concludes with: same-day wage payment for poor workers (vv.14-15), individual culpability (v.16), justice for the alien, orphan, and widow (v.17), and gleaning laws (vv.19-22). The gleaning laws -- leave some of your harvest for the foreigner, orphan, and widow -- are the OT\'s most practical anti-poverty provision. Unlike charity, gleaning preserves the dignity of the poor: they work for what they receive.',
            'cross': [
                ('Ruth 2:15-17', 'Boaz\'s protection and provision for Ruth in the fields is the Deuteronomy 24 gleaning laws in their most generous and generous interpretation.'),
                ('Lev 19:9-10', 'The Leviticus gleaning law provides the same protection using almost identical language -- showing the consistency of the Pentateuch\'s care-for-the-vulnerable ethic.'),
            ],
            'mac': [
                ('24:14-15', 'MacArthur: "Do not take advantage of a hired worker who is poor and needy... Pay them their wages each day before sunset, because they are poor and are counting on it. Otherwise they may cry to the LORD against you, and you will be guilty of sin." The daily wage requirement protects the most economically vulnerable -- those who live day-to-day. The theological warning is acute: the poor worker\'s cry to the LORD will be heard.'),
                ('24:16', 'MacArthur: "Parents are not to be put to death for their children, nor children put to death for their parents; each will die for their own sin." The principle of individual culpability is foundational to biblical jurisprudence. Covenant consequences flow from personal faithfulness or unfaithfulness -- they are not automatically passed to children. This verse is the basis for Ezekiel\'s extended argument in Ezek 18.'),
                ('24:19-22', 'MacArthur: The gleaning laws -- leave the forgotten sheaf, the remaining olives, the leftover grapes -- are the OT\'s most practical anti-poverty provision. Unlike charity, gleaning preserves the dignity of the poor: they work for what they receive, and the work is real and productive. Boaz and Ruth demonstrate the beauty of this system in its ideal operation.'),
            ],
        },
    ],
})

deu(25, {
    'title': 'Flogging Limits; Levirate Marriage; Amalek; Honest Weights',
    'sections': [
        {
            'header': 'Verses 1–12 — Flogging Limits; the Working Ox; Levirate Marriage',
            'verses': verse_range(1, 12),
            'heb': [
                ('yibbum', 'yibbum', 'levirate marriage',
                 'The yibbum (levirate: from Latin levir, husband\'s brother) requires a man to marry his brother\'s childless widow to perpetuate the dead brother\'s name and inheritance. This is the background for Ruth (where Boaz is a kinsman-redeemer) and the Sadducees\' question to Jesus (Matt 22:23-33).'),
                ('arbaim yakenu', 'arbaim yakenu', 'forty stripes he shall give him',
                 'Flogging limited to forty stripes is a dignity provision -- even the guilty retain their humanity. The Jewish practice of giving 39 stripes (not 40) arose to ensure the limit was never accidentally exceeded. Paul received this punishment five times (2 Cor 11:24).'),
            ],
            'ctx': 'Chapter 25 collects several case laws: flogging limited to 40 stripes (vv.1-3), the working ox not muzzled (v.4), levirate marriage (vv.5-10), the woman who grabs a man\'s genitals in a fight (vv.11-12), honest weights and measures (vv.13-16), and the command to blot out Amalek\'s memory (vv.17-19). The laws share the theme of protecting dignity and proportionality.',
            'cross': [
                ('1 Cor 9:9-10', '"Do not muzzle an ox while it is treading out the grain." Is it about oxen that God is concerned? Surely he says this for us." Paul applies Deuteronomy 25:4\'s ox law to the principle that workers deserve payment -- the specific law carries a general principle.'),
                ('Matt 22:24-28', '"Moses told us that if a man dies without having children, his brother must marry the widow and raise up offspring for him." The Sadducees\' levirate marriage question to Jesus is grounded in Deuteronomy 25\'s yibbum law.'),
            ],
            'mac': [
                ('25:1-3', 'MacArthur: "Forty lashes may be given but no more... do not have your fellow Israelite flogged more than forty lashes. If the guilty party is flogged more than that, your fellow Israelite will be degraded in your sight." The flogging limit is a dignity provision -- even the guilty retain their humanity. The covenant insists that punishment not destroy the person it corrects.'),
                ('25:4', 'MacArthur: "Do not muzzle an ox while it is treading out the grain." The ox that works must be allowed to eat from the work\'s produce. Paul generalises this principle to all workers (1 Cor 9:9-10; 1 Tim 5:18): those who labour for the community\'s spiritual food should receive material support from the community they serve.'),
                ('25:5-10', 'MacArthur: The levirate marriage provision is a creative response to a real social problem: a childless widow in the ancient world had no economic security without a son. The brother-in-law\'s responsibility is to provide an heir and maintain the family\'s inheritance. The sandal-removal ceremony for the brother who refuses provides social pressure without coercion.'),
            ],
            'craigie': [
                ('25:5-10', 'Craigie: The levirate institution reflects the ancient Israelite understanding that the family unit, including its name and inheritance, has a claim on surviving members. The obligation is corporate, not merely individual. The ḥaliṣah (sandal removal) ceremony allows release from the obligation with public accountability but without coercion.'),
            ],
        },
        {
            'header': 'Verses 13–19 — Honest Weights; Remember Amalek',
            'verses': verse_range(13, 19),
            'heb': [
                ('even shelema', 'even shelema', 'a full and fair weight / a complete stone',
                 'The honest weight laws use the same root as shalom (wholeness, completeness). Honest commerce is shalom commerce -- commerce that reflects the wholeness God intends for human community. Dishonest weights fragment shalom by introducing deception into every transaction.'),
                ('machah et-zecher Amalek', 'machah et-zecher Amalek', 'blot out the memory of Amalek',
                 'The command to blot out Amalek\'s memory is one of Deuteronomy\'s most absolute commands. Amalek attacked Israel\'s rear, targeting the weak and weary. The divine war against Amalek is the paradigm of God\'s eventual elimination of all predatory evil.'),
            ],
            'ctx': 'The chapter closes with honest weights and measures (vv.13-16) and the command to blot out Amalek\'s memory (vv.17-19). Both are covenant integrity laws: honest commerce reflects covenant integrity in daily life; the war against Amalek reflects covenant integrity in history. God, whose patience is demonstrated in the wilderness, will ultimately judge the predatory and the deceptive. The chapter ends with one of Deuteronomy\'s most urgent commands: do not forget.',
            'cross': [
                ('Rev 17:14; 19:19-21', 'The eschatological war against the beast echoes the Deuteronomy 25:17-19 Amalek command -- God\'s war against predatory evil is ultimately completed in the final judgment.'),
                ('Prov 11:1', '"The LORD detests dishonest scales, but accurate weights find favour with him." Proverbs develops the Deuteronomy 25 honest weights command into a general theological principle.'),
            ],
            'mac': [
                ('25:13-16', 'MacArthur: "Do not have two differing weights in your bag -- one heavy, one light... For the LORD your God detests anyone who does these things, anyone who deals dishonestly." The commercial fraud prohibition concludes with divine abhorrence -- not mild disapproval but toevah (abomination, detestable). Dishonest commerce is in the same category as idolatry in God\'s estimation.'),
                ('25:17-19', 'MacArthur: "Remember what the Amalekites did to you along the way when you came out of Egypt. When you were weary and worn out, they met you on your journey and attacked all who were lagging behind; they had no fear of God." Amalek attacked from behind, targeting the weak and exhausted -- the exact opposite of the covenant ethic of protecting the vulnerable. God\'s war against Amalek is not ethnic; it is the covenant Lord\'s judgment on predatory evil that targets the helpless.'),
            ],
        },
    ],
})

deu(26, {
    'title': 'Firstfruits and Tithes: Covenant Affirmation Before God',
    'sections': [
        {
            'header': 'Verses 1–15 — The Firstfruits Liturgy; the Third-Year Tithe Declaration',
            'verses': verse_range(1, 15),
            'heb': [
                ('arami oved avi', 'arami oved avi', 'my father was a wandering Aramean',
                 'The confessional formula of the firstfruits liturgy (v.5) begins with Abraham\'s or Jacob\'s Aramean ancestry -- stateless, nomadic, on the verge of extinction. The contrast with the present -- fruit in hand, standing in the land -- is the entire story of grace. Israel begins the liturgy not with its achievements but with its destitution.'),
                ('vehinei heiveti reshit peri haadamah',
                 'vehinei heiveti reshit peri haadamah',
                 'and now, behold, I have brought the firstfruits of the land',
                 'The "now" of the firstfruits presentation is the culmination of the entire covenantal narrative -- the Exodus wandering, the wilderness years, the gift of land -- all crystallised in the moment of placing the first basket of produce before God. The "behold" (hinneh) draws attention to the moment as significant.'),
            ],
            'ctx': 'Chapter 26 closes the central law section (chs.12-26) with a liturgy: the firstfruits confession (vv.1-11), the third-year tithe declaration (vv.12-15), and a bilateral covenant affirmation (vv.16-19). The firstfruits liturgy is one of the Bible\'s most beautiful covenant texts -- a portable salvation history in six verses, from Abraham\'s wandering through Egyptian slavery through Exodus to land possession. The tithe declaration is a covenant oath: I have done what you commanded; now bless me.',
            'cross': [
                ('Acts 7:9-15', 'Stephen\'s speech in Acts 7 recapitulates the same salvation history as Deuteronomy 26:5-9 -- from the patriarchs through Egypt through the Exodus. Both texts are covenant recitation: the story of what God did is the basis of present covenant loyalty.'),
                ('Heb 11:13-16', '"All these people were still living by faith when they died... and they admitted that they were foreigners and strangers on earth." The Hebrews community is described in language that echoes the "wandering Aramean" of Deuteronomy 26:5.'),
            ],
            'mac': [
                ('26:1-4', 'MacArthur: The firstfruits ceremony is an annual liturgical act of gratitude. The first-fruits principle is that the first and best goes to God -- not after you have secured your own provision, but before. The act of bringing first-fruits is simultaneously trust (I believe the rest will come) and gratitude (I know you gave this to me).'),
                ('26:5-10', 'MacArthur: The confession -- "my father was a wandering Aramean... the Egyptians mistreated us... we cried to the LORD, the God of our ancestors, and the LORD heard our voice" -- is salvation history condensed to its essence. It begins with destitution, moves through oppression, through redemption, and arrives at possession. To confess this annually is to re-appropriate the story as one\'s own.'),
                ('26:12-15', 'MacArthur: The third-year tithe declaration is one of Scripture\'s most detailed conscience examinations. "I have removed from my house the sacred portion and have given it to the Levite, the foreigner, the orphan and the widow, according to all you commanded." The declaration is under oath before God -- and it covers three years of compliance, not just the current year.'),
            ],
            'craigie': [
                ('26:1-11', 'Craigie: The firstfruits liturgy is the OT\'s most compact covenant recital -- a summary of Israel\'s saving history used as a vehicle for worship. The act of recitation re-appropriates the story: the worshipper who says "my father was a wandering Aramean" is not merely reporting history but claiming it as their own.'),
            ],
            'tigay': [
                ('26:5', 'Tigay: "Wandering Aramean" (arami oved avi) is famously ambiguous -- "wandering" or "perishing" or "about to perish." The JPS commentary prefers "wandering," reading it as a reference to Jacob/Abraham\'s nomadic ancestry. The emphasis is on destitution before God\'s gift.'),
            ],
        },
        {
            'header': 'Verses 16–19 — The Bilateral Covenant Affirmation',
            'verses': verse_range(16, 19),
            'heb': [
                ('am segulah', 'am segulah', 'treasured possession / special people',
                 'Segulah is a personal treasure, kept close and valued beyond its monetary worth. God declares Israel his segulah -- not merely his possession but his treasured possession. The word appears in ancient Near Eastern texts for the private treasury of a king, distinct from state wealth. Israel is God\'s personal treasure.'),
            ],
            'ctx': 'The covenant bilateral declaration is the climax of Deuteronomy\'s central law section. Israel declares: "The LORD is our God; we will walk in obedience to him." The LORD declares: "You are my treasured possession... a holy people." Both declarations are in the declarative, not the conditional: not "if you obey" but "I have declared." The covenant relationship is established by mutual acknowledgment -- gracious declaration calls forth responsive declaration.',
            'cross': [
                ('1 Pet 2:9', '"But you are a chosen people, a royal priesthood, a holy nation, God\'s special possession." Peter applies Deuteronomy 26:18-19\'s "treasured possession" language to the NT church.'),
                ('Rev 21:3', '"Look! God\'s dwelling place is now among the people, and he will dwell with them." The eschatological covenant formula echoes the bilateral declaration of Deuteronomy 26 -- God with his people, his people with God.'),
            ],
            'mac': [
                ('26:17-19', 'MacArthur: The covenant bilateral declaration is the climax of Deuteronomy\'s central law section. Israel declares: "The LORD is our God, we will walk in obedience to him." The LORD declares: "You are my treasured possession... a holy people." Both declarations are in the declarative, not the conditional. The covenant relationship is established by mutual acknowledgment. Grace declares; faith responds.'),
                ('26:16', 'MacArthur: "The LORD your God commands you this day to follow these decrees and laws; carefully observe them with all your heart and with all your soul." The "this day" repeated throughout Deuteronomy is the covenant\'s present-tense urgency. The covenant is not a historical document to be admired from a distance but a living claim being made today.'),
            ],
        },
    ],
})

print("DEUT-4 complete: chapters 19–26 built.")
