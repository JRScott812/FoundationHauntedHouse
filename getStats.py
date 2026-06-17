import sys
import json
import pandas as pd


def main():
    if len(sys.argv) < 2:
        print("Usage: python getStats.py <path-to-history.json>")
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        df = pd.read_json(file_path)
    except FileNotFoundError:
        print(f"Error: file not found: {file_path}")
        sys.exit(1)
    except (ValueError, json.JSONDecodeError) as exc:
        print(f"Error: could not parse JSON file: {exc}")
        sys.exit(1)

    required_columns = {"size", "entryTime", "registrationTime", "cancelled"}
    missing = required_columns - set(df.columns)
    if missing:
        print(f"Error: missing required columns: {', '.join(sorted(missing))}")
        sys.exit(1)

    df = df[df["cancelled"] != 1.0]

    total_people = df["size"].sum()
    number_of_groups = df["size"].count()

    df["waitTimeSeconds"] = (df["entryTime"] - df["registrationTime"]) / 1000

    avg_wait_time_minutes = df["waitTimeSeconds"].mean() / 60
    longest_wait_time_minutes = df["waitTimeSeconds"].max() / 60

    print("Number of groups:        ", number_of_groups)
    print("Total people:            ", total_people)
    print("Average wait time (min): ", round(avg_wait_time_minutes, 2))
    print("Longest wait time (min): ", round(longest_wait_time_minutes, 2))


if __name__ == "__main__":
    main()
