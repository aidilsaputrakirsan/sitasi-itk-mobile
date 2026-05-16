import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import {
  Modal,
  Portal,
  Searchbar,
  Surface,
  Text,
  TouchableRipple,
  Divider,
} from 'react-native-paper';
import { Check, ChevronDown, GraduationCap, UserMinus, X } from 'lucide-react-native';
import { palette } from '../../theme';
import type { AvailableDosen } from '../../types';

interface Props {
  label: string;
  value: number | null;
  options: AvailableDosen[];
  exclude?: (number | null | undefined)[];
  onChange: (id: number | null) => void;
  /** Izinkan opsi "Tidak ada" untuk un-set pilihan */
  allowNone?: boolean;
  required?: boolean;
  error?: boolean;
}

export function DosenPicker({
  label,
  value,
  options,
  exclude = [],
  onChange,
  allowNone,
  required,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((d) => d.id === value) ?? null;

  const filtered = useMemo(() => {
    const excludeSet = new Set(exclude.filter((x): x is number => typeof x === 'number'));
    const list = options.filter((d) => !excludeSet.has(d.id) || d.id === value);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.nip?.toLowerCase().includes(q) ||
        d.prodi?.toLowerCase().includes(q)
    );
  }, [options, exclude, query, value]);

  const handleSelect = (id: number | null) => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  return (
    <View>
      {/* Trigger button */}
      <TouchableRipple
        onPress={() => setOpen(true)}
        borderless={false}
        rippleColor="rgba(30,108,183,0.08)"
        style={[styles.trigger, error && styles.triggerError, selected && styles.triggerSelected]}
      >
        <View style={styles.triggerInner}>
          <Surface elevation={0} style={styles.triggerIcon}>
            <GraduationCap size={18} color={palette.primary} strokeWidth={2} />
          </Surface>
          <View style={{ flex: 1 }}>
            <Text variant="labelSmall" style={styles.triggerLabel}>
              {label}
              {required && <Text style={{ color: palette.error }}> *</Text>}
            </Text>
            {selected ? (
              <Text variant="bodyMedium" style={styles.triggerValue} numberOfLines={1}>
                {selected.name}
              </Text>
            ) : (
              <Text variant="bodyMedium" style={styles.triggerPlaceholder}>
                Ketuk untuk pilih dosen
              </Text>
            )}
            {selected?.nip && (
              <Text variant="labelSmall" style={styles.triggerMeta} numberOfLines={1}>
                NIP: {selected.nip}
                {selected.prodi ? ` · ${selected.prodi}` : ''}
              </Text>
            )}
          </View>
          <ChevronDown size={20} color={palette.onSurfaceVariant} strokeWidth={2} />
        </View>
      </TouchableRipple>

      {/* Modal */}
      <Portal>
        <Modal
          visible={open}
          onDismiss={() => setOpen(false)}
          contentContainerStyle={styles.modal}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={styles.modalTitle}>
                Pilih {label}
              </Text>
              <Text variant="bodySmall" style={styles.modalSubtitle}>
                {filtered.length} dosen tersedia
              </Text>
            </View>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={12}
              style={styles.closeBtn}
            >
              <X size={20} color={palette.onSurfaceVariant} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Search */}
          <Searchbar
            placeholder="Cari nama, NIP, atau prodi..."
            value={query}
            onChangeText={setQuery}
            style={styles.search}
            inputStyle={styles.searchInput}
            elevation={0}
          />

          <Divider />

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            ListHeaderComponent={
              allowNone ? (
                <TouchableRipple
                  onPress={() => handleSelect(null)}
                  rippleColor="rgba(30,108,183,0.08)"
                >
                  <View style={styles.itemRow}>
                    <Surface elevation={0} style={[styles.itemIcon, styles.itemIconNone]}>
                      <UserMinus size={18} color={palette.onSurfaceVariant} strokeWidth={2} />
                    </Surface>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" style={styles.itemNameNone}>
                        Tidak ada pembimbing
                      </Text>
                      <Text variant="labelSmall" style={styles.itemMeta}>
                        Hapus pilihan pembimbing ini
                      </Text>
                    </View>
                    {value === null && <Check size={18} color={palette.primary} strokeWidth={2.4} />}
                  </View>
                </TouchableRipple>
              ) : null
            }
            renderItem={({ item }) => {
              const isSelected = item.id === value;
              return (
                <TouchableRipple
                  onPress={() => handleSelect(item.id)}
                  rippleColor="rgba(30,108,183,0.08)"
                >
                  <View style={[styles.itemRow, isSelected && styles.itemRowSelected]}>
                    <Surface
                      elevation={0}
                      style={[styles.itemIcon, isSelected && styles.itemIconSelected]}
                    >
                      <Text
                        variant="labelMedium"
                        style={[styles.itemInitial, isSelected && { color: '#fff' }]}
                      >
                        {item.name?.charAt(0).toUpperCase() ?? '?'}
                      </Text>
                    </Surface>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" style={styles.itemName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text variant="labelSmall" style={styles.itemMeta} numberOfLines={1}>
                        {item.nip ? `NIP ${item.nip}` : ''}
                        {item.nip && item.prodi ? ' · ' : ''}
                        {item.prodi ?? ''}
                        {item.is_eksternal ? ' · Eksternal' : ''}
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color={palette.primary} strokeWidth={2.4} />}
                  </View>
                </TouchableRipple>
              );
            }}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Tidak ada dosen yang cocok
                </Text>
                <Text variant="bodySmall" style={styles.emptySub}>
                  Coba kata kunci lain
                </Text>
              </View>
            }
            keyboardShouldPersistTaps="handled"
            style={styles.list}
          />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Trigger */
  trigger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.outline,
    borderRadius: 12,
  },
  triggerError: { borderColor: palette.error },
  triggerSelected: { borderColor: palette.primary, borderWidth: 1.5 },
  triggerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  triggerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: palette.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerLabel: {
    color: palette.onSurfaceVariant,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  triggerValue: { color: palette.onSurface, fontWeight: '600', marginTop: 2 },
  triggerPlaceholder: { color: palette.onSurfaceVariant, fontStyle: 'italic', marginTop: 2 },
  triggerMeta: { color: palette.onSurfaceVariant, marginTop: 2 },

  /* Modal */
  modal: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 60,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  modalTitle: { color: palette.onSurface, fontWeight: '700' },
  modalSubtitle: { color: palette.onSurfaceVariant, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: palette.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },

  search: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: palette.surfaceVariant,
    borderRadius: 12,
  },
  searchInput: { fontSize: 14, minHeight: 0 },

  list: { flexGrow: 0 },
  divider: { marginHorizontal: 16 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  itemRowSelected: { backgroundColor: palette.primaryContainer },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: palette.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconSelected: { backgroundColor: palette.primary },
  itemIconNone: { backgroundColor: palette.surfaceVariant },
  itemInitial: { color: palette.primary, fontWeight: '800' },
  itemName: { color: palette.onSurface, fontWeight: '600' },
  itemNameNone: { color: palette.onSurface, fontWeight: '600', fontStyle: 'italic' },
  itemMeta: { color: palette.onSurfaceVariant, marginTop: 2 },

  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: { color: palette.onSurface, fontWeight: '600' },
  emptySub: { color: palette.onSurfaceVariant, marginTop: 4 },
});
