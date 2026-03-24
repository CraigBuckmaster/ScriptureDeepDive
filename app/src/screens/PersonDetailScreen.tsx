/**
 * PersonDetailScreen — Full-page person bio. Navigable from PeoplePanel,
 * search results, explore menu. Has "See on Family Tree" button.
 */

import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePersonDetail } from '../hooks/usePersonDetail';
import { BadgeChip } from '../components/BadgeChip';
import { base, spacing, eras, eraNames } from '../theme';

export default function PersonDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { personId } = route.params ?? {};
  const { person, parents, children, spouses, isLoading } = usePersonDetail(personId);

  if (isLoading || !person) {
    return <View style={{ flex: 1, backgroundColor: base.bg }} />;
  }

  const eraColor = person.era ? (eras[person.era] ?? base.gold) : base.gold;
  const eraLabel = person.era ? (eraNames[person.era] ?? person.era) : '';
  let refs: string[] = [];
  try { refs = person.refs_json ? JSON.parse(person.refs_json) : []; } catch {}

  const PersonLink = ({ id, name }: { id: string; name: string }) => (
    <TouchableOpacity onPress={() => navigation.push('PersonDetail', { personId: id })} style={{ marginRight: 8 }}>
      <Text style={{ color: eraColor, fontFamily: 'SourceSans3_500Medium', fontSize: 13, textDecorationLine: 'underline' }}>
        {name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: base.gold, fontSize: 14, marginBottom: spacing.md }}>← Back</Text>
        </TouchableOpacity>

        {eraLabel ? <BadgeChip label={eraLabel} color={eraColor} /> : null}

        <Text style={{ color: base.text, fontFamily: 'Cinzel_600SemiBold', fontSize: 24, marginTop: spacing.sm }}>
          {person.name}
        </Text>
        {person.dates && (
          <Text style={{ color: base.textDim, fontFamily: 'SourceSans3_400Regular', fontSize: 13, marginTop: 4 }}>
            {person.dates}
          </Text>
        )}

        <View style={{ height: 1, backgroundColor: base.border, marginVertical: spacing.md }} />

        <Text style={{ color: base.gold, fontFamily: 'EBGaramond_500Medium', fontSize: 16 }}>
          {person.role}
        </Text>

        {/* Family */}
        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          {(parents.father || parents.mother) && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
              <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: 'SourceSans3_600SemiBold', minWidth: 60 }}>
                Parents
              </Text>
              {parents.father && <PersonLink id={parents.father.id} name={parents.father.name} />}
              {parents.mother && <PersonLink id={parents.mother.id} name={parents.mother.name} />}
            </View>
          )}
          {spouses.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
              <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: 'SourceSans3_600SemiBold', minWidth: 60 }}>
                {spouses.length > 1 ? 'Spouses' : 'Spouse'}
              </Text>
              {spouses.map((s) => <PersonLink key={s.id} id={s.id} name={s.name} />)}
            </View>
          )}
          {children.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
              <Text style={{ color: base.textMuted, fontSize: 11, fontFamily: 'SourceSans3_600SemiBold', minWidth: 60 }}>
                Children
              </Text>
              {children.slice(0, 15).map((c) => <PersonLink key={c.id} id={c.id} name={c.name} />)}
              {children.length > 15 && <Text style={{ color: base.textMuted, fontSize: 11 }}>+{children.length - 15} more</Text>}
            </View>
          )}
        </View>

        {/* Bio */}
        {person.bio && (
          <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 15, lineHeight: 24, marginTop: spacing.lg }}>
            {person.bio}
          </Text>
        )}

        {person.scripture_role && (
          <View style={{ marginTop: spacing.lg }}>
            <Text style={{ color: base.gold, fontFamily: 'Cinzel_400Regular', fontSize: 11, letterSpacing: 0.4 }}>
              ROLE IN SCRIPTURE
            </Text>
            <Text style={{ color: base.textDim, fontFamily: 'EBGaramond_400Regular', fontSize: 15, lineHeight: 24, marginTop: spacing.xs }}>
              {person.scripture_role}
            </Text>
          </View>
        )}

        {refs.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.lg }}>
            {refs.map((r, i) => <BadgeChip key={i} label={r} color={base.textMuted} />)}
          </View>
        )}

        {/* See on Family Tree */}
        <TouchableOpacity
          onPress={() => navigation.navigate('GenealogyTree', { personId: person.id })}
          style={{ marginTop: spacing.lg, paddingVertical: spacing.sm }}
        >
          <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 14 }}>
            See on Family Tree →
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
