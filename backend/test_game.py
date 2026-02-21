from game_engine import lookup_monster

monster = lookup_monster("Aboleth")

if monster:
    print(f"Found it! The {monster['name']} has {monster['hit_points']} HP.")
else:
    print("Monster not found.")